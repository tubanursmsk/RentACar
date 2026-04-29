using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class CarService : ICarService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IWebHostEnvironment _hostEnvironment;

    public CarService(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment hostEnvironment)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _hostEnvironment = hostEnvironment;
    }

    public async Task<ApiResponse<IEnumerable<CarDto>>> GetAllAsync()
    {
        var cars = await _unitOfWork.Cars.GetAllWithDetailsAsync();
        var dtos = _mapper.Map<IEnumerable<CarDto>>(cars);
        return ApiResponse<IEnumerable<CarDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<CarDto>> GetByIdAsync(int id)
    {
        var car = await _unitOfWork.Cars.GetByIdWithImagesAsync(id);
        if (car == null) 
            return ApiResponse<CarDto>.ErrorResult("Araç bulunamadı.");

        var dto = _mapper.Map<CarDto>(car);
        return ApiResponse<CarDto>.SuccessResult(dto);
    }

    public async Task<ApiResponse<int>> CreateAsync(CarCreateDto dto)
    {
        var car = _mapper.Map<Car>(dto);

        // --- ÇOKLU RESİM YÜKLEME MANTIĞI ---
        if (dto.ImageFiles != null && dto.ImageFiles.Count > 0)
        {
            var uploadsFolder = Path.Combine(_hostEnvironment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "cars");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            bool isFirstImage = true;

            foreach (var file in dto.ImageFiles)
            {
                if (file.Length > 0)
                {
                    // 1. Dosyayı Kaydet
                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fileStream);
                    }

                    var dbPath = $"/images/cars/{uniqueFileName}";

                    // 2. İlk resimse Car tablosundaki ana ImageUrl'e de yaz
                    if (isFirstImage)
                    {
                        car.ImageUrl = dbPath;
                    }

                    // 3. CarImages tablosuna ekle
                    car.CarImages.Add(new CarImage
                    {
                        ImageUrl = dbPath,
                        IsMain = isFirstImage
                    });

                    isFirstImage = false;
                }
            }
        }

        await _unitOfWork.Cars.AddAsync(car);
        await _unitOfWork.SaveChangesAsync();
        
        return ApiResponse<int>.SuccessResult(car.Id, "Araç ve görseller başarıyla eklendi.");
    }

    public async Task<ApiResponse<bool>> UpdateAsync(int id, CarUpdateDto dto)
    {
        var car = await _unitOfWork.Cars.GetByIdWithImagesAsync(id);

        if (car == null)
            return ApiResponse<bool>.ErrorResult("Güncellenecek araç bulunamadı.");

        // DTO -> Entity eşlemesi (Resimler hariç, AutoMapper Ignore kurallarına göre)
        _mapper.Map(dto, car);

        // --- Yeni resimler eklendiyse ---
        if (dto.ImageFiles is { Count: > 0 })
        {
            var uploadsFolder = Path.Combine(_hostEnvironment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "cars");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            foreach (var file in dto.ImageFiles)
            {
                if (file == null || file.Length <= 0) continue;

                var safeFileName = Path.GetFileName(file.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                var dbPath = $"/images/cars/{uniqueFileName}";

                car.CarImages.Add(new CarImage
                {
                    CarId = car.Id,
                    ImageUrl = dbPath,
                    IsMain = false 
                });
                
                // Eğer aracın mevcut bir ana resmi yoksa, yüklenen ilk resmi ana resim yap
                if (string.IsNullOrEmpty(car.ImageUrl))
                {
                    car.ImageUrl = dbPath;
                }
            }
        }

        _unitOfWork.Cars.Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç başarıyla güncellendi.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var car = await _unitOfWork.Cars.GetByIdAsync(id);
        if (car == null) 
            return ApiResponse<bool>.ErrorResult("Silinecek araç bulunamadı.");

        _unitOfWork.Cars.Delete(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç silindi.");
    }
}