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
            CreatedDate = DateTime.Now // API'de CreatedDate gelmiyorsa buraya eklenmeli
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

    /// POST: /Car/Create — Araç Ekleme İşlemi
    [HttpPost]
    public async Task<IActionResult> Create(CarCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            ViewData["Title"] = "Araç Ekle";
            await PopulateDropdowns();
            return View(model);
        }

        // 1. JSON yerine Multipart form datası oluşturuyoruz
        using var content = new MultipartFormDataContent();
        
        content.Add(new StringContent(model.BrandId.ToString()), "BrandId");
        content.Add(new StringContent(model.CurrentLocationId.ToString()), "CurrentLocationId");
        content.Add(new StringContent(model.Model), "Model");
        content.Add(new StringContent(model.Year.ToString()), "Year");
        content.Add(new StringContent(model.Plate), "Plate");
        
        // Fiyatlarda virgül/nokta kültür sorununu çözmek için InvariantCulture kullanıyoruz
        content.Add(new StringContent(model.DailyPrice.ToString(System.Globalization.CultureInfo.InvariantCulture)), "DailyPrice");
        
        content.Add(new StringContent(model.MinFindeksScore.ToString()), "MinFindeksScore");
        content.Add(new StringContent(((int)model.Status).ToString()), "Status");

        // 2. Eğer resim seçildiyse Multipart'a dosyayı ekle
        if (model.ImageFile != null && model.ImageFile.Length > 0)
        {
            var streamContent = new StreamContent(model.ImageFile.OpenReadStream());
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(model.ImageFile.ContentType);
            content.Add(streamContent, "ImageFile", model.ImageFile.FileName); 
        }

        // 3. PostAsync yerine PostMultipartAsync kullanıyoruz
        var response = await _apiService.PostMultipartAsync<int>("api/Car", content);

        if (response == null || !response.Success)
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araç eklenirken hata oluştu.";
            await PopulateDropdowns();
            return View(model);
        }

        TempData["SuccessMessage"] = "Araç başarıyla eklendi.";
        return RedirectToAction(nameof(Index));
    }


    // POST: /Car/Update/5 — Araç Güncelleme İşlemi
    [HttpPost]
    public async Task<IActionResult> Update(int id, CarUpdateViewModel model)
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

        using var content = new MultipartFormDataContent();
        
        content.Add(new StringContent(model.Id.ToString()), "Id");
        content.Add(new StringContent(model.BrandId.ToString()), "BrandId");
        content.Add(new StringContent(model.CurrentLocationId.ToString()), "CurrentLocationId");
        content.Add(new StringContent(model.Model), "Model");
        content.Add(new StringContent(model.Year.ToString()), "Year");
        content.Add(new StringContent(model.Plate), "Plate");
        content.Add(new StringContent(model.DailyPrice.ToString(System.Globalization.CultureInfo.InvariantCulture)), "DailyPrice");
        content.Add(new StringContent(model.MinFindeksScore.ToString()), "MinFindeksScore");
        content.Add(new StringContent(((int)model.Status).ToString()), "Status");

        // Eğer YENİ bir resim seçildiyse onu da yolla
        if (model.ImageFile != null && model.ImageFile.Length > 0)
        {
            var streamContent = new StreamContent(model.ImageFile.OpenReadStream());
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(model.ImageFile.ContentType);
            content.Add(streamContent, "ImageFile", model.ImageFile.FileName); 
        }

        // PutAsync yerine PutMultipartAsync kullanıyoruz
        var response = await _apiService.PutMultipartAsync<bool>($"api/Car/{id}", content);

        if (response == null || !response.Success)
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araç güncellenirken hata oluştu.";
            await PopulateDropdowns();
            return View(model);
        }

        TempData["SuccessMessage"] = "Araç başarıyla güncellendi.";
        return RedirectToAction(nameof(Index));
    }

    // POST: /Car/Delete/5 — Araç Silme İşlemi
    [HttpPost]
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