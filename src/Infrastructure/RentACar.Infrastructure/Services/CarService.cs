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

    // ── PAGED LIST ──
    public async Task<ApiResponse<PaginatedResult<CarDto>>> GetPagedAsync(int pageNumber, int pageSize)
    {
        var (items, totalCount) = await _unitOfWork.Cars.GetPagedWithDetailsAsync(pageNumber, pageSize);
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

    // ── CREATE ──
    public async Task<ApiResponse<int>> CreateAsync(CarCreateDto dto)
    {
        var car = _mapper.Map<Car>(dto);
        car.Status = dto.Status == 0 ? CarStatus.Available : dto.Status;

        // Resimleri işle
        await ProcessImageUploadsAsync(car, dto.ImageFiles, isNewCar: true);

        await _unitOfWork.Cars.AddAsync(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(car.Id, "Araç başarıyla eklendi.");
    }

    // ── UPDATE ──
    public async Task<ApiResponse<bool>> UpdateAsync(int id, CarUpdateDto dto)
    {
        var car = await _unitOfWork.Cars.GetByIdWithImagesAsync(id);
        if (car == null)
            return ApiResponse<bool>.ErrorResult("Güncellenecek araç bulunamadı.");

        // Mevcut ImageUrl ve CarImages koruyacağız (AutoMapper override etmeyecek)
        var currentImageUrl = car.ImageUrl;

        // DTO -> Entity (ImageUrl, CarImages, IFormFile alanları AutoMapper'da Ignore edildi)
        _mapper.Map(dto, car);

        // ImageUrl'i geri yükle (DTO'dan gelen null olabilir)
        car.ImageUrl = currentImageUrl;
        car.UpdatedDate = DateTime.UtcNow;

        // Yeni resimler eklendiyse işle
        await ProcessImageUploadsAsync(car, dto.ImageFiles, isNewCar: false);

        _unitOfWork.Cars.Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç başarıyla güncellendi.");
    }

    // ── DELETE (Soft) ──
    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var car = await _unitOfWork.Cars.GetByIdAsync(id);
        if (car == null)
            return ApiResponse<bool>.ErrorResult("Silinecek araç bulunamadı.");

        car.IsDeleted = true;
        car.UpdatedDate = DateTime.UtcNow;
        _unitOfWork.Cars.Update(car);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Araç silindi.");
    }

    // ── HELPER: Resim upload işlemi ──
    private async Task ProcessImageUploadsAsync(Car car, List<IFormFile>? imageFiles, bool isNewCar)
    {
        if (imageFiles == null || imageFiles.Count == 0)
            return;

        var webRoot = _hostEnvironment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsFolder = Path.Combine(webRoot, "images", "cars");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Yeni araçsa: ilk resim ana resim olur
        // Mevcut araçsa: zaten ana resim varsa yeni gelenler ek resim
        bool isFirstImage = isNewCar || string.IsNullOrEmpty(car.ImageUrl);

        foreach (var file in imageFiles)
        {
            if (file == null || file.Length == 0) continue;

            // Validasyon
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                continue;

            if (file.Length > 5 * 1024 * 1024) // 5MB
                continue;

            // Güvenli dosya adı
            var safeFileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(uploadsFolder, safeFileName);
            var dbPath = $"/images/cars/{safeFileName}";

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Ana resim
            if (isFirstImage)
            {
                car.ImageUrl = dbPath;
                isFirstImage = false;

                car.CarImages.Add(new CarImage
                {
                    ImageUrl = dbPath,
                    IsMain = true
                });
            }
            else
            {
                car.CarImages.Add(new CarImage
                {
                    ImageUrl = dbPath,
                    IsMain = false
                });
            }
        }
    }
}