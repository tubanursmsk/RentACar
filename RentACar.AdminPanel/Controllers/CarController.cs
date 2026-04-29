using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Responses;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,Staff")]
public class CarController : Controller
{
    private readonly BaseApiService _apiService;
    private readonly ILogger<CarController> _logger;

    public CarController(BaseApiService apiService, ILogger<CarController> logger)
    {
        _apiService = apiService;
        _logger = logger;
    }

    // GET: /Car — Araç Listesi (Sayfalanmış)
    [HttpGet]
    public async Task<IActionResult> Index(int pageNumber = 1, int pageSize = 10)
    {
        ViewData["Title"] = "Araç Yönetimi";
        ViewData["Breadcrumb"] = "Araçlar";

        var response = await _apiService.GetAsync<PaginatedResult<CarDto>>(
            $"api/Car/Paged?pageNumber={pageNumber}&pageSize={pageSize}");

        if (response == null || !response.Success)
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araçlar yüklenemedi.";
            var emptyModel = new CarPaginatedViewModel();
            return View(emptyModel);
        }

        var cars = response.Data?.Items?.Select(c => new CarListViewModel
        {
            Id = c.Id,
            BrandName = c.BrandName,
            Model = c.Model,
            Year = c.Year,
            Plate = c.Plate,
            DailyPrice = c.DailyPrice,
            CurrentLocationName = c.CurrentLocationName,
            Status = c.Status,
            ImageUrl = c.ImageUrl,
            CreatedDate = DateTime.Now
        }).ToList() ?? new List<CarListViewModel>();

        var model = new CarPaginatedViewModel
        {
            Cars = cars,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = response.Data?.TotalCount ?? 0
        };

        return View(model);
    }

    // GET: /Car/Create — Araç Ekleme Formu
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        ViewData["Title"] = "Araç Ekle";
        ViewData["Breadcrumb"] = "Araç Ekle";

        await PopulateDropdowns();
        return View();
    }

    // POST: /Car/Create — Araç Ekleme İşlemi
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CarCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            ViewData["Title"] = "Araç Ekle";
            await PopulateDropdowns();
            return View(model);
        }

        // DTO'ya dönüştür
        var dto = new CarCreateDto
        {
            BrandId = model.BrandId,
            CurrentLocationId = model.CurrentLocationId,
            Model = model.Model,
            Year = model.Year,
            Plate = model.Plate,
            DailyPrice = model.DailyPrice,
            MinFindeksScore = model.MinFindeksScore,
            Status = model.Status
        };

        // API'ye gönder
        var response = await _apiService.PostAsync<CarCreateDto, int>("api/Car", dto);

        if (response == null || !response.Success)
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araç eklenirken hata oluştu.";
            await PopulateDropdowns();
            return View(model);
        }

        TempData["SuccessMessage"] = "Araç başarıyla eklendi.";
        return RedirectToAction(nameof(Index));
    }

    // GET: /Car/Edit/5 — Araç Düzenleme Formu
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        ViewData["Title"] = "Araç Düzenle";
        ViewData["Breadcrumb"] = "Araç Düzenle";

        var response = await _apiService.GetAsync<CarDto>($"api/Car/{id}");

        if (response == null || !response.Success || response.Data == null)
        {
            TempData["ErrorMessage"] = "Araç bulunamadı.";
            return RedirectToAction(nameof(Index));
        }

        var car = response.Data;
        var model = new CarEditViewModel
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
            CurrentImageUrl = car.ImageUrl
        };

        await PopulateDropdowns();
        return View(model);
    }

    // POST: /Car/Edit/5 — Araç Güncelleme İşlemi
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, CarEditViewModel model)
    {
        if (id != model.Id)
        {
            TempData["ErrorMessage"] = "Araç ID'si uyuşmuyor.";
            return RedirectToAction(nameof(Index));
        }

        if (!ModelState.IsValid)
        {
            ViewData["Title"] = "Araç Düzenle";
            await PopulateDropdowns();
            return View(model);
        }

        // DTO'ya dönüştür
        var dto = new CarUpdateDto
        {
            Id = model.Id,
            BrandId = model.BrandId,
            CurrentLocationId = model.CurrentLocationId,
            Model = model.Model,
            Year = model.Year,
            Plate = model.Plate,
            DailyPrice = model.DailyPrice,
            MinFindeksScore = model.MinFindeksScore,
            Status = model.Status
        };

        // API'ye gönder
        var response = await _apiService.PutAsync<CarUpdateDto, bool>($"api/Car/{id}", dto);

        if (response == null || !response.Success)
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araç güncellenirken hata oluştu.";
            await PopulateDropdowns();
            return View(model);
        }

        TempData["SuccessMessage"] = "Araç başarıyla güncellendi.";
        return RedirectToAction(nameof(Index));
    }

    // POST: /Car/UploadImage/5 — Araç Resmi Yükleme
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UploadImage(int id, IFormFile file)
    {
        // Validasyon
        if (file == null || file.Length == 0)
            return Json(new { success = false, message = "Resim dosyası seçiniz." });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var fileExtension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
            return Json(new { success = false, message = "Sadece JPG, PNG, GIF dosyaları kabul edilir." });

        if (file.Length > 5 * 1024 * 1024) // 5MB
            return Json(new { success = false, message = "Dosya boyutu 5MB'ı geçemez." });

        try
        {
            // MultipartFormDataContent oluştur
            var content = new MultipartFormDataContent();
            
            using (var stream = file.OpenReadStream())
            {
                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
                content.Add(fileContent, "file", file.FileName);

                // API'ye gönder
                var response = await _apiService.PutMultipartAsync<object>($"api/Car/{id}/UploadImage", content);

                if (response == null || !response.Success)
                {
                    return Json(new { success = false, message = response?.Message ?? "Resim yüklenirken hata oluştu." });
                }

                TempData["SuccessMessage"] = "Araç resmi başarıyla yüklendi.";
                return Json(new { success = true, message = "Araç resmi başarıyla yüklendi." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Araç {id} resmi yüklenirken hata: {ex.Message}");
            return Json(new { success = false, message = "Resim yüklenirken hata oluştu." });
        }
    }

    // POST: /Car/Delete/5 — Araç Silme İşlemi
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/Car/{id}");

        if (response == null || !response.Success)
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araç silinirken hata oluştu.";
        }
        else
        {
            TempData["SuccessMessage"] = "Araç başarıyla silindi.";
        }

        return RedirectToAction(nameof(Index));
    }

    // ── Helper Metot: Dropdown'ları Doldur ──
    private async Task PopulateDropdowns()
    {
        // Markaları al
        var brandsResponse = await _apiService.GetAsync<IEnumerable<BrandDto>>("api/Brand/All");
        ViewBag.Brands = brandsResponse?.Data ?? new List<BrandDto>();

        // Şubeleri al
        var locationsResponse = await _apiService.GetAsync<IEnumerable<LocationDto>>("api/Location/All");
        ViewBag.Locations = locationsResponse?.Data ?? new List<LocationDto>();
    }
}