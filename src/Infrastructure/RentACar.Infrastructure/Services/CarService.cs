using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class CarService : ICarService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CarService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    // --- MÜSAİTLİK ALGORİTMASI (THE CORE) ---
    public async Task<ApiResponse<PaginatedResult<CarDto>>> GetAvailableCarsAsync(AvailableCarSearchDto searchDto)
    {
        // 1. Tarih doğrulama
        if (searchDto.PickUpDate < DateTime.Now.Date || searchDto.DropOffDate <= searchDto.PickUpDate)
            return ApiResponse<PaginatedResult<CarDto>>.ErrorResult("Geçersiz tarih aralığı seçtiniz.");

        // 2. Çakışan (Overlapping) Rezervasyonları Bul
        // Formül: (Kiralama Başlangıç <= İstenen Bitiş) VE (Kiralama Bitiş >= İstenen Başlangıç)
        var overlappingCarIds = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => !r.IsDeleted &&
                           r.RentStartDate <= searchDto.DropOffDate &&
                           r.RentEndDate >= searchDto.PickUpDate)
            .Select(r => r.CarId)
            .ToListAsync();

        // 3. Müsait Araçları Filtrele
        var availableCarsQuery = _unitOfWork.Repository<Car>()
            .GetWhere(c => !c.IsDeleted &&
                           c.CurrentLocationId == searchDto.PickUpLocationId && // İstenen şubede mi?
                           c.Status != CarStatus.InMaintenance &&               // Bakımda değilse
                           c.Status != CarStatus.Passive &&                     // Pasif değilse
                           !overlappingCarIds.Contains(c.Id))                   // Ve o tarihlerde çakışan rezervasyonu YOKSA
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation);

        // 4. Sayfalama (Pagination)
        var totalCount = await availableCarsQuery.CountAsync();
        var items = await availableCarsQuery
            .Skip((searchDto.PageNumber - 1) * searchDto.PageSize)
            .Take(searchDto.PageSize)
            .ToListAsync();

        var dtos = _mapper.Map<List<CarDto>>(items);

        var result = new PaginatedResult<CarDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = searchDto.PageNumber,
            PageSize = searchDto.PageSize
        };

        return ApiResponse<PaginatedResult<CarDto>>.SuccessResult(result, "Müsait araçlar başarıyla listelendi.");
    }

    // --- STANDART CRUD İŞLEMLERİ ---

    public async Task<ApiResponse<PaginatedResult<CarDto>>> GetPagedCarsAsync(int pageNumber, int pageSize)
    {
        var query = _unitOfWork.Repository<Car>()
            .GetWhere(c => !c.IsDeleted)
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        var dtos = _mapper.Map<List<CarDto>>(items);
        return ApiResponse<PaginatedResult<CarDto>>.SuccessResult(new PaginatedResult<CarDto>
        { Items = dtos, TotalCount = totalCount, PageNumber = pageNumber, PageSize = pageSize });
    }

    public async Task<ApiResponse<CarDto>> GetCarByIdAsync(int id)
    {
        var car = await _unitOfWork.Repository<Car>()
            .GetWhere(c => c.Id == id && !c.IsDeleted)
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation)
            .FirstOrDefaultAsync();

        if (car == null) return ApiResponse<CarDto>.ErrorResult("Araç bulunamadı.");
        return ApiResponse<CarDto>.SuccessResult(_mapper.Map<CarDto>(car));
    }

    public async Task<ApiResponse<int>> CreateCarAsync(CarCreateDto dto)
    {
        var car = _mapper.Map<Car>(dto);
        car.Status = CarStatus.Available; // Yeni eklenen araç varsayılan olarak müsaittir

        // RESİM KAYDETME BLOĞU 
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            // 1. Dosyanın kaydedileceği klasör yolu (wwwroot/images/cars)
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "cars");

            // Klasör yoksa oluştur
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            // 2. Çakışmaları önlemek için ismin başına benzersiz bir Guid ekle
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.ImageFile.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 3. Fiziksel olarak dosyayı API'nin wwwroot klasörüne kopyala
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ImageFile.CopyToAsync(fileStream);
            }

            // 4. Veritabanına kaydedilecek URL yolunu belirle
            car.ImageUrl = "/images/cars/" + uniqueFileName;
        }

        await _unitOfWork.Repository<Car>().AddAsync(car);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<int>.SuccessResult(car.Id, "Araç başarıyla eklendi.");
    }

    public async Task<ApiResponse<bool>> UpdateCarAsync(CarUpdateDto dto)
    {
        // DTO içindeki ID ile veriyi buluyoruz
        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(dto.Id);

        if (car == null || car.IsDeleted)
            return ApiResponse<bool>.ErrorResult("Güncellenecek araç bulunamadı.");

        // 1. DİKKAT: AutoMapper'ın mevcut resmi silmesini engellemek için eski URL'i yedekliyoruz
        var oldImageUrl = car.ImageUrl;

        // AutoMapper ile DTO'daki verileri (Model, Yıl, Fiyat vb.) mevcut entity üzerine yansıtıyoruz
        _mapper.Map(dto, car);

        // 2. YENİ RESİM EKLENDİ Mİ KONTROLÜ
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "cars");

            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.ImageFile.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.ImageFile.CopyToAsync(fileStream);
            }

            // Yeni resmin URL'ini ata
            car.ImageUrl = "/images/cars/" + uniqueFileName;
            
            // Opsiyonel: Sunucuda yer kaplamaması için eski resmi fiziksel olarak silebilirsin
            /*
            if (!string.IsNullOrEmpty(oldImageUrl))
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", oldImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }
            */
        }
        else
        {
            // Eğer yeni resim seçilmediyse, yedeklediğimiz eski resmi geri koyuyoruz
            car.ImageUrl = oldImageUrl;
        }

        car.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<Car>().Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç başarıyla güncellendi.");
    }

    public async Task<ApiResponse<bool>> DeleteCarAsync(int id)
    {
        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(id);
        if (car == null || car.IsDeleted) return ApiResponse<bool>.ErrorResult("Araç bulunamadı.");

        car.IsDeleted = true; // Soft Delete
        car.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<Car>().Update(car);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Araç sistemden kaldırıldı.");
    }
}