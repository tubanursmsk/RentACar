using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;

namespace RentACar.AdminPanel.Controllers;

[Authorize]
[Route("Car")]
public class CarController : Controller
{
    private readonly BaseApiService _api;

    public CarController(BaseApiService api)
    {
        _api = api;
    }

    // ── GET /Car ── Liste + modal verileri ──────────────────────
    [HttpGet("")]
    [HttpGet("Index")]
    public async Task<IActionResult> Index(int pageNumber = 1, int pageSize = 10)
    {
        // 1. Araç listesi (sayfalı)
        var carsResp = await _api.GetAsync<PagedCarResult>(
            $"api/Car/Paged?pageNumber={pageNumber}&pageSize={pageSize}");

        // 2. Dropdown verileri (Create/Edit modal için)
        var brandsResp = await _api.GetAsync<List<BrandItem>>("api/Brand/All");
        var locationsResp = await _api.GetAsync<List<LocationItem>>("api/Location/All");

        var vm = new CarListViewModel
        {
            PageNumber = pageNumber,
            PageSize = pageSize,
        };

        if (carsResp?.Success == true && carsResp.Data != null)
        {
            vm.TotalCount = carsResp.Data.TotalCount;
            vm.Cars = carsResp.Data.Items.Select(c => new CarItemViewModel
            {
                Id = c.Id,
                BrandId = c.BrandId,
                BrandName = c.BrandName,
                Model = c.Model,
                Year = c.Year,
                Plate = c.Plate,
                DailyPrice = c.DailyPrice,
                MinFindeksScore = c.MinFindeksScore,
                CurrentLocationId = c.CurrentLocationId,
                CurrentLocationName = c.CurrentLocationName,
                Status = c.Status,
                ImageUrl = c.ImageUrl,
            }).ToList();
        }

        if (brandsResp?.Success == true && brandsResp.Data != null)
            vm.Brands = brandsResp.Data.Select(b => new SelectItem { Id = b.Id, Name = b.Name }).ToList();

        if (locationsResp?.Success == true && locationsResp.Data != null)
            vm.Locations = locationsResp.Data.Select(l => new SelectItem { Id = l.Id, Name = l.Name }).ToList();

        return View(vm);
    }

    // ── GET /Car/Detail/{id} ── Detay modalı için JSON ──────────
    [HttpGet("Detail/{id}")]
    public async Task<IActionResult> Detail(int id)
    {
        var resp = await _api.GetAsync<CarDto>($"api/Car/{id}");
        if (resp?.Success != true || resp.Data == null)
            return NotFound();

        return Json(resp.Data);
    }

    // ── POST /Car/Create ── Yeni araç ekle (multipart) ──────────
    [HttpPost("Create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CarCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            TempData["ErrorMessage"] = "Lütfen tüm zorunlu alanları doldurun.";
            return RedirectToAction(nameof(Index));
        }

        // Multipart form oluştur
        var content = new MultipartFormDataContent();
        content.Add(new StringContent(model.BrandId.ToString()), "BrandId");
        content.Add(new StringContent(model.CurrentLocationId.ToString()), "CurrentLocationId");
        content.Add(new StringContent(model.Model), "Model");
        content.Add(new StringContent(model.Year.ToString()), "Year");
        content.Add(new StringContent(model.Plate), "Plate");
        content.Add(new StringContent(model.DailyPrice.ToString()), "DailyPrice");
        content.Add(new StringContent(model.MinFindeksScore.ToString()), "MinFindeksScore");
        content.Add(new StringContent("Available"), "Status");

        if (model.Image != null && model.Image.Length > 0)
        {
            var stream = model.Image.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(model.Image.ContentType);
            content.Add(fileContent, "Image", model.Image.FileName);
        }

        var resp = await _api.PostMultipartAsync<int>("api/Car", content);

        if (resp?.Success == true)
            TempData["SuccessMessage"] = "Araç başarıyla eklendi.";
        else
            TempData["ErrorMessage"] = resp?.Message ?? "Araç eklenemedi.";

        return RedirectToAction(nameof(Index));
    }

    // ── POST /Car/Edit ── Araç güncelle (multipart) ─────────────
    [HttpPost("Edit")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(CarEditViewModel model)
    {
        if (!ModelState.IsValid)
        {
            TempData["ErrorMessage"] = "Lütfen tüm zorunlu alanları doldurun.";
            return RedirectToAction(nameof(Index));
        }

        var content = new MultipartFormDataContent();
        content.Add(new StringContent(model.Id.ToString()), "Id");
        content.Add(new StringContent(model.BrandId.ToString()), "BrandId");
        content.Add(new StringContent(model.CurrentLocationId.ToString()), "CurrentLocationId");
        content.Add(new StringContent(model.Model), "Model");
        content.Add(new StringContent(model.Year.ToString()), "Year");
        content.Add(new StringContent(model.Plate), "Plate");
        content.Add(new StringContent(model.DailyPrice.ToString()), "DailyPrice");
        content.Add(new StringContent(model.MinFindeksScore.ToString()), "MinFindeksScore");
        content.Add(new StringContent(model.Status), "Status");

        if (model.Image != null && model.Image.Length > 0)
        {
            var stream = model.Image.OpenReadStream();
            var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(model.Image.ContentType);
            content.Add(fileContent, "Image", model.Image.FileName);
        }

        var resp = await _api.PutMultipartAsync<bool>($"api/Car/{model.Id}", content);

        if (resp?.Success == true)
            TempData["SuccessMessage"] = "Araç başarıyla güncellendi.";
        else
            TempData["ErrorMessage"] = resp?.Message ?? "Araç güncellenemedi.";

        return RedirectToAction(nameof(Index));
    }

    // ── POST /Car/Delete/{id} ── Soft delete ────────────────────
    [HttpPost("Delete/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var resp = await _api.DeleteAsync($"api/Car/{id}");

        if (resp?.Success == true)
            TempData["SuccessMessage"] = "Araç başarıyla silindi.";
        else
            TempData["ErrorMessage"] = resp?.Message ?? "Araç silinemedi.";

        return RedirectToAction(nameof(Index));
    }

    // ── İç yardımcı tipler (API deserialize için) ───────────────
    private class PagedCarResult
    {
        public List<CarDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }

    private class CarDto
    {
        public int Id { get; set; }
        public int BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public int CurrentLocationId { get; set; }
        public string CurrentLocationName { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Plate { get; set; } = string.Empty;
        public decimal DailyPrice { get; set; }
        public int MinFindeksScore { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }

    private class BrandItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    private class LocationItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
