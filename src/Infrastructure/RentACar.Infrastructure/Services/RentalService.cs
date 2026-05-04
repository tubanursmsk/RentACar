using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class RentalService : IRentalService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RentalService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }


    //! ── 1. MÜŞTERİ KENDİ ADINA KİRALAMA YAPAR ──
    public async Task<ApiResponse<int>> CreateRentalAsync(int currentUserId, RentalCreateDto dto)
    {
        if (dto.RentStartDate < DateTime.Now.Date || dto.RentEndDate <= dto.RentStartDate)
            return ApiResponse<int>.ErrorResult("Geçersiz tarih aralığı.");

        var customer = await _unitOfWork.Repository<Customer>().GetWhere(c => c.UserId == currentUserId).FirstOrDefaultAsync();
        if (customer == null) return ApiResponse<int>.ErrorResult("Müşteri profili bulunamadı.");

        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(dto.CarId);
        if (car == null || car.IsDeleted) return ApiResponse<int>.ErrorResult("Araç bulunamadı.");

        if (customer.FindeksScore < car.MinFindeksScore)
            return ApiResponse<int>.ErrorResult($"Bu aracı kiralamak için Findeks puanınız yetersiz. (Gereken: {car.MinFindeksScore}, Sizin: {customer.FindeksScore})");

        bool isCarRented = await _unitOfWork.Repository<Rental>().AnyAsync(r =>
            r.CarId == dto.CarId &&
            !r.IsDeleted &&
            r.Status != ReservationStatus.Cancelled &&
            r.Status != ReservationStatus.Completed &&
            r.RentStartDate <= dto.RentEndDate &&
            r.RentEndDate >= dto.RentStartDate);

        if (isCarRented)
            return ApiResponse<int>.ErrorResult("Araç seçilen tarihler arasında maalesef dolu.");

        int totalDays = (dto.RentEndDate - dto.RentStartDate).Days;
        if (totalDays == 0) totalDays = 1;
        decimal totalAmount = totalDays * car.DailyPrice;

        var rental = _mapper.Map<Rental>(dto);
        rental.CustomerId = customer.Id;
        rental.TotalAmount = totalAmount;
        rental.Status = ReservationStatus.Pending;
        rental.IsPaid = false;

        await _unitOfWork.Repository<Rental>().AddAsync(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(rental.Id, "Rezervasyon talebiniz başarıyla alındı.");
    }


    //! ── 2. ADMİN BAŞKASI (MÜŞTERİ) ADINA KİRALAMA YAPAR ──
    public async Task<ApiResponse<int>> AdminCreateRentalAsync(RentalCreateDto dto)
    {
        // AdminPanel'den form ile gelirken CustomerId'nin gönderildiğini varsayıyoruz.
        // Eğer RentalCreateDto'ya eklemediysen hata alabilirsin. Oraya 'public int CustomerId { get; set; }' eklenmeli.

        if (dto.RentStartDate < DateTime.Now.Date || dto.RentEndDate <= dto.RentStartDate)
            return ApiResponse<int>.ErrorResult("Geçersiz tarih aralığı.");

        // Admin kiralama yaparken müşteriyi dto.CustomerId üzerinden buluyoruz
        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(dto.CustomerId);
        if (customer == null || customer.IsDeleted) return ApiResponse<int>.ErrorResult("Seçilen müşteri bulunamadı.");

        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(dto.CarId);
        if (car == null || car.IsDeleted) return ApiResponse<int>.ErrorResult("Araç bulunamadı.");

        // Not: Admin isterse Findeks kuralını esnetebilir (Business rule kararı). Biz burada kontrol ediyoruz.
        if (customer.FindeksScore < car.MinFindeksScore)
            return ApiResponse<int>.ErrorResult($"Müşterinin Findeks puanı yetersiz. (Gereken: {car.MinFindeksScore}, Müşterinin: {customer.FindeksScore})");

        bool isCarRented = await _unitOfWork.Repository<Rental>().AnyAsync(r =>
            r.CarId == dto.CarId &&
            !r.IsDeleted &&
            r.Status != ReservationStatus.Cancelled &&
            r.Status != ReservationStatus.Completed &&
            r.RentStartDate <= dto.RentEndDate &&
            r.RentEndDate >= dto.RentStartDate);

        if (isCarRented)
            return ApiResponse<int>.ErrorResult("Araç seçilen tarihler arasında maalesef dolu.");

        int totalDays = (dto.RentEndDate - dto.RentStartDate).Days;
        if (totalDays == 0) totalDays = 1;
        decimal totalAmount = totalDays * car.DailyPrice;

        var rental = _mapper.Map<Rental>(dto);
        rental.CustomerId = customer.Id; // Admin'in seçtiği müşteri
        rental.TotalAmount = totalAmount;
        rental.Status = ReservationStatus.Approved; // Admin kendi kiraladığında direkt onaylı başlatabiliriz
        rental.IsPaid = true; // Admin tahsilatı ofiste yapmıştır varsayımı

        // Aracı hemen "Kirada" durumuna çekelim mi? (Opsiyonel)
        car.Status = CarStatus.Rented;
        _unitOfWork.Repository<Car>().Update(car);

        await _unitOfWork.Repository<Rental>().AddAsync(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(rental.Id, "Kiralama başarıyla oluşturuldu.");
    }


    //! ── 3. MÜŞTERİNİN KENDİ KİRALAMALARINI GÖRMESİ ──
    public async Task<ApiResponse<IEnumerable<RentalDto>>> GetMyRentalsAsync(int userId)
    {
        var customer = await _unitOfWork.Repository<Customer>().GetWhere(c => c.UserId == userId).FirstOrDefaultAsync();
        if (customer == null) return ApiResponse<IEnumerable<RentalDto>>.ErrorResult("Müşteri profili bulunamadı.");

        var rentals = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.CustomerId == customer.Id && !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Include(r => r.PickUpLocation)
            .Include(r => r.DropOffLocation)
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<RentalDto>>(rentals);
        return ApiResponse<IEnumerable<RentalDto>>.SuccessResult(dtos);
    }


    //! ── 4. ADMİN İÇİN TÜM KİRALAMALARIN SAYFALAMALI LİSTESİ ──
    public async Task<ApiResponse<PaginatedResult<RentalDto>>> GetPagedRentalsAsync(int pageNumber, int pageSize)
    {
        var query = _unitOfWork.Repository<Rental>().GetWhere(r => !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Include(r => r.PickUpLocation)
            .Include(r => r.DropOffLocation)
            .OrderByDescending(r => r.CreatedDate);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var dtos = _mapper.Map<List<RentalDto>>(items);

        var result = new PaginatedResult<RentalDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return ApiResponse<PaginatedResult<RentalDto>>.SuccessResult(result);
    }


    //! ── 5. KİRALAMA DETAYI GETİRME ──
    public async Task<ApiResponse<RentalDto>> GetRentalByIdAsync(int id)
    {
        var rental = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.Id == id && !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .Include(r => r.PickUpLocation)
            .Include(r => r.DropOffLocation)
            .FirstOrDefaultAsync();

        if (rental == null) return ApiResponse<RentalDto>.ErrorResult("Kiralama bulunamadı.");

        return ApiResponse<RentalDto>.SuccessResult(_mapper.Map<RentalDto>(rental));
    }

    // ── 6. STATE MACHINE: REZERVASYON ONAYLAMA ──
    public async Task<ApiResponse<bool>> ApproveRentalAsync(int rentalId)
    {
        var rental = await _unitOfWork.Repository<Rental>().GetByIdAsync(rentalId);
        if (rental == null) return ApiResponse<bool>.ErrorResult("Kiralama bulunamadı.");

        if (rental.Status != ReservationStatus.Pending)
            return ApiResponse<bool>.ErrorResult("Sadece beklemede olan rezervasyonlar onaylanabilir.");

        rental.Status = ReservationStatus.Approved;

        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(rental.CarId);
        if (car != null)
        {
            car.Status = CarStatus.Rented;
            _unitOfWork.Repository<Car>().Update(car);
        }

        _unitOfWork.Repository<Rental>().Update(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Rezervasyon onaylandı ve araç statüsü güncellendi.");
    }

    // ── 7. STATE MACHINE: ARAÇ İADE ALMA (TAMAMLAMA) ──
    public async Task<ApiResponse<bool>> CompleteRentalAsync(int rentalId)
    {
        var rental = await _unitOfWork.Repository<Rental>().GetByIdAsync(rentalId);
        if (rental == null) return ApiResponse<bool>.ErrorResult("Kiralama bulunamadı.");

        if (rental.Status != ReservationStatus.Approved)
            return ApiResponse<bool>.ErrorResult("Sadece onaylanmış kiralamalar tamamlanabilir.");

        rental.Status = ReservationStatus.Completed;
        rental.ReturnDate = DateTime.UtcNow;

        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(rental.CarId);
        if (car != null)
        {
            car.Status = CarStatus.Available;
            car.CurrentLocationId = rental.DropOffLocationId;
            _unitOfWork.Repository<Car>().Update(car);
        }

        _unitOfWork.Repository<Rental>().Update(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç iade alındı ve işlem tamamlandı.");
    }


    //! ── 8. STATE MACHINE: KİRALAMA/REZERVASYON İPTALİ ──
    public async Task<ApiResponse<bool>> CancelRentalAsync(int rentalId)
    {
        var rental = await _unitOfWork.Repository<Rental>().GetByIdAsync(rentalId);
        if (rental == null) return ApiResponse<bool>.ErrorResult("Kiralama bulunamadı.");

        if (rental.Status == ReservationStatus.Completed)
            return ApiResponse<bool>.ErrorResult("Tamamlanmış bir kiralama iptal edilemez.");

        // Eğer araç daha önceden "Kirada (Rented)" statüsüne geçtiyse, iptal edildiği için tekrar "Müsait" yapalım
        if (rental.Status == ReservationStatus.Approved)
        {
            var car = await _unitOfWork.Repository<Car>().GetByIdAsync(rental.CarId);
            if (car != null)
            {
                car.Status = CarStatus.Available;
                _unitOfWork.Repository<Car>().Update(car);
            }
        }

        rental.Status = ReservationStatus.Cancelled;
        _unitOfWork.Repository<Rental>().Update(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Kiralama başarıyla iptal edildi.");
    }


    //! ── 9. SİLME İŞLEMİ (SOFT DELETE) ──
    // ── 9. SİLME İŞLEMİ (SOFT DELETE) ──
    public async Task<ApiResponse<bool>> DeleteRentalAsync(int id)
    {
        var rental = await _unitOfWork.Repository<Rental>().GetByIdAsync(id);
        if (rental == null || rental.IsDeleted)
            return ApiResponse<bool>.ErrorResult("Silinecek kayıt bulunamadı.");

        rental.IsDeleted = true; // Sadece IsDeleted true yapıyoruz, DeletedDate satırını kaldırdık.

        _unitOfWork.Repository<Rental>().Update(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Kiralama kaydı silindi.");
    }
}