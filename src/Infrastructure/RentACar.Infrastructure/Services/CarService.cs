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

    // FİLTRELER EKLENDİ
    public async Task<ApiResponse<PaginatedResult<CarDto>>> GetPagedAsync(
        int pageNumber, int pageSize, 
        int? locationId = null, int? fuelType = null, int? transmissionType = null, 
        decimal? minPrice = null, decimal? maxPrice = null, string? searchTerm = null, List<int>? brandIds = null)
    {
        var (items, totalCount) = await _unitOfWork.Cars.GetPagedWithDetailsAsync(
            pageNumber, pageSize, locationId, fuelType, transmissionType, minPrice, maxPrice, searchTerm, brandIds);
        
        var dtos = _mapper.Map<List<CarDto>>(items);

        var result = new PaginatedResult<CarDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return ApiResponse<PaginatedResult<CarDto>>.SuccessResult(result, "Araçlar başarıyla listelendi.");
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
        car.Status = dto.Status == 0 ? CarStatus.Available : dto.Status;

        await ProcessImageUploadsAsync(car, dto.ImageFiles, isNewCar: true);

        await _unitOfWork.Cars.AddAsync(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(car.Id, "Araç başarıyla eklendi.");
    }

    public async Task<ApiResponse<bool>> UpdateAsync(int id, CarUpdateDto dto)
    {
        var car = await _unitOfWork.Cars.GetByIdWithImagesAsync(id);
        if (car == null) return ApiResponse<bool>.ErrorResult("Güncellenecek araç bulunamadı.");

        var currentImageUrl = car.ImageUrl;
        _mapper.Map(dto, car);

        car.ImageUrl = currentImageUrl;
        car.UpdatedDate = DateTime.UtcNow;

        await ProcessImageUploadsAsync(car, dto.ImageFiles, isNewCar: false);

        _unitOfWork.Cars.Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç başarıyla güncellendi.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var car = await _unitOfWork.Cars.GetByIdAsync(id);
        if (car == null) return ApiResponse<bool>.ErrorResult("Silinecek araç bulunamadı.");

        car.IsDeleted = true;
        car.UpdatedDate = DateTime.UtcNow;
        _unitOfWork.Cars.Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç silindi.");
    }

    private async Task ProcessImageUploadsAsync(Car car, List<IFormFile>? imageFiles, bool isNewCar)
    {
        if (imageFiles == null || imageFiles.Count == 0) return;

        var webRoot = _hostEnvironment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsFolder = Path.Combine(webRoot, "images", "cars");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        bool isFirstImage = isNewCar || string.IsNullOrEmpty(car.ImageUrl);

        foreach (var file in imageFiles)
        {
            if (file == null || file.Length == 0) continue;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext)) continue;

            if (file.Length > 5 * 1024 * 1024) continue;

            var safeFileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsFolder, safeFileName);
            var dbPath = $"/images/cars/{safeFileName}";

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            if (isFirstImage)
            {
                car.ImageUrl = dbPath;
                isFirstImage = false;
                car.CarImages.Add(new CarImage { ImageUrl = dbPath, IsMain = true });
            }
            else
            {
                car.CarImages.Add(new CarImage { ImageUrl = dbPath, IsMain = false });
            }
        }
    }
}