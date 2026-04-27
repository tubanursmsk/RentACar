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

    public async Task<ApiResponse<int>> CreateRentalAsync(int currentUserId, RentalCreateDto dto)
    {
        // 1. Tarih Validasyonu
        if (dto.RentStartDate < DateTime.Now.Date || dto.RentEndDate <= dto.RentStartDate)
            return ApiResponse<int>.ErrorResult("Geçersiz tarih aralığı.");

        // 2. Müşteri (Customer) Bulma ve Findeks Kontrolü
        var customer = await _unitOfWork.Repository<Customer>().GetWhere(c => c.UserId == currentUserId).FirstOrDefaultAsync();
        if (customer == null) return ApiResponse<int>.ErrorResult("Müşteri profili bulunamadı.");

        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(dto.CarId);
        if (car == null || car.IsDeleted) return ApiResponse<int>.ErrorResult("Araç bulunamadı.");

        if (customer.FindeksScore < car.MinFindeksScore)
            return ApiResponse<int>.ErrorResult($"Bu aracı kiralamak için Findeks puanınız yetersiz. (Gereken: {car.MinFindeksScore}, Sizin: {customer.FindeksScore})");

        // 3. Tarih Çakışma (Overlap) Algoritması
        bool isCarRented = await _unitOfWork.Repository<Rental>().AnyAsync(r => 
            r.CarId == dto.CarId && 
            !r.IsDeleted && 
            r.Status != ReservationStatus.Cancelled &&
            r.Status != ReservationStatus.Completed &&
            r.RentStartDate <= dto.RentEndDate && 
            r.RentEndDate >= dto.RentStartDate);

        if (isCarRented)
            return ApiResponse<int>.ErrorResult("Araç seçilen tarihler arasında maalesef dolu.");

        // 4. Fiyat Hesaplama (Backend'de yapılır)
        int totalDays = (dto.RentEndDate - dto.RentStartDate).Days;
        if (totalDays == 0) totalDays = 1; // Aynı gün kiralama minimum 1 gün sayılır
        decimal totalAmount = totalDays * car.DailyPrice;

        // 5. Kayıt İşlemi
        var rental = _mapper.Map<Rental>(dto);
        rental.CustomerId = customer.Id;
        rental.TotalAmount = totalAmount;
        rental.Status = ReservationStatus.Pending; // State Machine başlangıcı
        rental.IsPaid = false;

        await _unitOfWork.Repository<Rental>().AddAsync(rental);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(rental.Id, "Rezervasyon talebiniz başarıyla alındı.");
    }

    // STATE MACHINE: Rezervasyon Onaylama (Admin/Staff yapar)
    public async Task<ApiResponse<bool>> ApproveRentalAsync(int rentalId)
    {
        var rental = await _unitOfWork.Repository<Rental>().GetByIdAsync(rentalId);
        if (rental == null) return ApiResponse<bool>.ErrorResult("Kiralama bulunamadı.");

        rental.Status = ReservationStatus.Approved;
        
        // Aracı fiziksel olarak "Kirada" statüsüne çekiyoruz
        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(rental.CarId);
        if (car == null) return ApiResponse<bool>.ErrorResult("Araç bulunamadı.");
        
        _unitOfWork.Repository<Rental>().Update(rental);
        _unitOfWork.Repository<Car>().Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Rezervasyon onaylandı ve araç statüsü güncellendi.");
    }

    // STATE MACHINE: Araç İade Alma
    public async Task<ApiResponse<bool>> CompleteRentalAsync(int rentalId)
    {
        var rental = await _unitOfWork.Repository<Rental>().GetByIdAsync(rentalId);
        if (rental == null) return ApiResponse<bool>.ErrorResult("Kiralama bulunamadı.");

        rental.Status = ReservationStatus.Completed;
        rental.ReturnDate = DateTime.UtcNow;

        // Aracı tekrar Müsait statüsüne çek ve bulunduğu şubeyi DropOff location yap
        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(rental.CarId);
        car.Status = CarStatus.Available;
        car.CurrentLocationId = rental.DropOffLocationId;

        _unitOfWork.Repository<Rental>().Update(rental);
        _unitOfWork.Repository<Car>().Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç iade alındı ve işlem tamamlandı.");
    }

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
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<RentalDto>>(rentals);
        return ApiResponse<IEnumerable<RentalDto>>.SuccessResult(dtos);
    }
}