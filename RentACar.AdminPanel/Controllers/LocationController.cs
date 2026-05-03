using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Location;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,CompanyManager,Staff")] // API'deki yetki kurallarına göre uyarlandı
public class LocationController : Controller
{
    private readonly BaseApiService _apiService;

    public LocationController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    // ── 1. GET: /Location (Şube Listesi) ──
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 10)
    {
        ViewData["Title"] = "Şube Yönetimi";
        ViewData["Breadcrumb"] = "Şubeler";

        var model = new LocationListViewModel();
        model.Locations.PageNumber = page;
        model.Locations.PageSize = pageSize;

        try
        {
            var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<LocationDto>>(
                $"api/Location/Paged?pageNumber={page}&pageSize={pageSize}");

            if (response != null && response.Success && response.Data != null)
            {
                model.Locations.Items = response.Data.Items.ToList();
                model.Locations.TotalCount = response.Data.TotalCount;
            }
        }
        catch (System.Text.Json.JsonException)
        {
            var listResponse = await _apiService.GetAsync<IEnumerable<LocationDto>>(
                $"api/Location/Paged?pageNumber={page}&pageSize={pageSize}");

            if (listResponse != null && listResponse.Success && listResponse.Data != null)
            {
                model.Locations.Items = listResponse.Data.ToList();
                model.Locations.TotalCount = listResponse.Data.Count();
            }
        }

        return View(model);
    }

    // ── 2. GET: /Location/Create (Şube Ekleme Formu) ──
    [HttpGet]
    public IActionResult Create()
    {
        ViewData["Title"] = "Şube Ekle";
        ViewData["Breadcrumb"] = "Şube Ekle";

        return View(new LocationCreateViewModel());
    }

    // ── 3. POST: /Location/Create (Şube Ekleme İşlemi) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(LocationCreateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        // Dosya olmadığı için standart PostAsync kullanıyoruz
        var dto = new LocationCreateDto 
        { 
            Name = model.Name,
            City = model.City,
            Address = model.Address
        };

        var response = await _apiService.PostAsync<LocationCreateDto, int>("api/Location", dto);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Şube başarıyla eklendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Şube eklenirken bir hata oluştu.";
        return View(model);
    }

    // ── 4. GET: /Location/Edit/{id} (Şube Düzenleme Formu) ──
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        ViewData["Title"] = "Şube Düzenle";
        ViewData["Breadcrumb"] = "Şube Düzenle";

        var response = await _apiService.GetAsync<LocationDto>($"api/Location/{id}");

        if (response == null || !response.Success || response.Data == null)
        {
            TempData["ErrorMessage"] = "Güncellenecek şube bulunamadı.";
            return RedirectToAction(nameof(Index));
        }

        var model = new LocationUpdateViewModel
        {
            Id = response.Data.Id,
            Name = response.Data.Name,
            City = response.Data.City,
            Address = response.Data.Address
        };

        return View(model);
    }

    // ── 5. POST: /Location/Edit/{id} (Şube Güncelleme İşlemi) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(LocationUpdateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var dto = new LocationUpdateDto 
        { 
            Id = model.Id, 
            Name = model.Name,
            City = model.City,
            Address = model.Address
        };

        var response = await _apiService.PutAsync<LocationUpdateDto, object>($"api/Location/{model.Id}", dto);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Şube başarıyla güncellendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Güncelleme sırasında hata oluştu.";
        return View(model);
    }

    // ── 6. POST: /Location/Delete/{id} (Şube Silme İşlemi) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/Location/{id}");

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Şube başarıyla silindi.";
        }
        else
        {
            TempData["ErrorMessage"] = response?.Message ?? "Şube silinemedi. (Bu şubeye bağlı araçlar olabilir.)";
        }

        return RedirectToAction(nameof(Index));
    }

    // ── 7. EXCEL ÇIKTISI ──
    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<IEnumerable<LocationDto>>("api/Location/All");
        var locations = response?.Data?.ToList() ?? new List<LocationDto>();

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Şubeler");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Şube Adı";
            worksheet.Cell(1, 3).Value = "Şehir";
            worksheet.Cell(1, 4).Value = "Adres";

            var headerRange = worksheet.Range("A1:D1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            int row = 2;
            foreach (var item in locations)
            {
                worksheet.Cell(row, 1).Value = item.Id;
                worksheet.Cell(row, 2).Value = item.Name;
                worksheet.Cell(row, 3).Value = item.City;
                worksheet.Cell(row, 4).Value = item.Address;
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                var content = stream.ToArray();
                var fileName = $"Subeler_{DateTime.Now:ddMMyyyy}.xlsx";

                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }
    }
}