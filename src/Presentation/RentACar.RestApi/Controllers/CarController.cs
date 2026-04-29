using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarController : ControllerBase
{
    private readonly ICarService _carService;
    private readonly IWebHostEnvironment _hostEnvironment;
    private readonly ILogger<CarController> _logger;

    public CarController(ICarService carService, IWebHostEnvironment hostEnvironment, ILogger<CarController> logger)
    {
        _carService = carService;
        _hostEnvironment = hostEnvironment;
        _logger = logger;
    }

    // Herkese Açık: Müşteriler araç arayabilir
    [HttpPost("SearchAvailable")]
    public async Task<IActionResult> SearchAvailableCars([FromBody] AvailableCarSearchDto searchDto)
    {
        return Ok(await _carService.GetAvailableCarsAsync(searchDto));
    }

    // Herkese Açık: Tüm araçların vitrini (Sayfalamalı)
    [HttpGet("Paged")]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await _carService.GetPagedCarsAsync(pageNumber, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) => Ok(await _carService.GetCarByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Create([FromBody] CarCreateDto dto) => Ok(await _carService.CreateCarAsync(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, [FromBody] CarUpdateDto carUpdateDto)
    {
        if (id != carUpdateDto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResult("URL'deki ID ile gönderilen nesnenin ID'si uyuşmuyor."));
        }

        var result = await _carService.UpdateCarAsync(carUpdateDto);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(ApiResponse<object>.SuccessResult(new { }, "Araç bilgileri başarıyla güncellendi."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id) => Ok(await _carService.DeleteCarAsync(id));

    // ── IMAGE UPLOAD ENDPOINT ──
    /// <summary>
    /// Araç resmi yükleme - Multipart/form-data
    /// </summary>
    [HttpPut("{id}/UploadImage")]
    [Authorize(Roles = "Admin,Staff")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        // 1. Validasyonlar
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResult("Resim dosyası seçiniz."));

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(ApiResponse<object>.ErrorResult("Sadece JPG, PNG, GIF dosyaları kabul edilir."));

        if (file.Length > 5 * 1024 * 1024) // 5MB
            return BadRequest(ApiResponse<object>.ErrorResult("Dosya boyutu 5MB'ı geçemez."));

        try
        {
            // 2. Araçı veritabanından al
            var carResponse = await _carService.GetCarByIdAsync(id);
            if (!carResponse.Success || carResponse.Data == null)
                return NotFound(ApiResponse<object>.ErrorResult("Araç bulunamadı."));

            // 3. Dosyayı kaydet
            var uploadsFolder = Path.Combine(_hostEnvironment.WebRootPath, "uploads", "cars");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Eski resmi sil (varsa)
            if (!string.IsNullOrEmpty(carResponse.Data.ImageUrl))
            {
                var oldFilePath = Path.Combine(_hostEnvironment.WebRootPath, carResponse.Data.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    try { System.IO.File.Delete(oldFilePath); }
                    catch { /* Eski dosya silinmezse devam et */ }
                }
            }

            // Yeni dosya adı oluştur (güvenlik için)
            var fileName = $"car_{id}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            var relativePath = $"/uploads/cars/{fileName}";

            // Dosyayı kaydet
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 4. Veri tabanında güncelle
            var car = carResponse.Data;
            var updateDto = new CarUpdateDto
            {
                Id = car.Id,
                BrandId = car.BrandId,
                CurrentLocationId = car.CurrentLocationId,
                Model = car.Model,
                Year = car.Year,
                Plate = car.Plate,
                DailyPrice = car.DailyPrice,
                MinFindeksScore = car.MinFindeksScore,
                Status = car.Status,
                ImageFile = relativePath  // ← Yeni resim URL'si
            };

            var updateResult = await _carService.UpdateCarAsync(updateDto);

            if (!updateResult.Success)
            {
                // Dosyayı geri sil
                try { System.IO.File.Delete(filePath); }
                catch { }
                return BadRequest(updateResult);
            }

            _logger.LogInformation($"Araç {id} için resim yüklendi: {fileName}");

            return Ok(ApiResponse<object>.SuccessResult(
                new { imagePath = relativePath },
                "Araç resmi başarıyla yüklendi."
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Araç {id} resmi yüklenirken hata: {ex.Message}");
            return StatusCode(500, ApiResponse<object>.ErrorResult("Resim yüklenirken hata oluştu."));
        }
    }
}