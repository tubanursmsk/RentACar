using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Responses;
using System.Net.Http.Headers;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,Staff")]
public class BrandController : Controller
{
    private readonly BaseApiService _apiService;
    private readonly IConfiguration _configuration;
    private readonly string _apiBaseUrl;

    public BrandController(BaseApiService apiService, IConfiguration configuration)
    {
        _apiService = apiService;
        _configuration = configuration;
        _apiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "http://localhost:5065/";
    }

    // ── 1. GET: /Brand (Marka Listesi) ──
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 10)
    {
        ViewData["Title"] = "Marka Yönetimi";
        ViewData["Breadcrumb"] = "Markalar";

        var model = new BrandListViewModel();
        model.Brands.PageNumber = page;
        model.Brands.PageSize = pageSize;

        try
        {
            var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<BrandDto>>(
                $"api/Brand/Paged?pageNumber={page}&pageSize={pageSize}");

            if (response != null && response.Success && response.Data != null)
            {
                var brands = response.Data.Items.ToList();
                
                // LOGO URL DÜZELTMESİ
                foreach (var brand in brands)
                {
                    if (!string.IsNullOrEmpty(brand.LogoUrl) && !brand.LogoUrl.StartsWith("http"))
                    {
                        brand.LogoUrl = $"{_apiBaseUrl.TrimEnd('/')}{brand.LogoUrl}";
                    }
                }

                model.Brands.Items = brands;
                model.Brands.TotalCount = response.Data.TotalCount;
            }
        }
        catch (System.Text.Json.JsonException)
        {
            var listResponse = await _apiService.GetAsync<IEnumerable<BrandDto>>(
                $"api/Brand/Paged?pageNumber={page}&pageSize={pageSize}");

            if (listResponse != null && listResponse.Success && listResponse.Data != null)
            {
                var brands = listResponse.Data.ToList();
                
                // LOGO URL DÜZELTMESİ
                foreach (var brand in brands)
                {
                    if (!string.IsNullOrEmpty(brand.LogoUrl) && !brand.LogoUrl.StartsWith("http"))
                    {
                        brand.LogoUrl = $"{_apiBaseUrl.TrimEnd('/')}{brand.LogoUrl}";
                    }
                }

                model.Brands.Items = brands;
                model.Brands.TotalCount = brands.Count;
            }
        }

        return View(model);
    }

    // ── 2. GET: /Brand/Create (Yeni Marka Ekleme Formu) ──
    [HttpGet]
    public IActionResult Create()
    {
        ViewData["Title"] = "Marka Ekle";
        ViewData["Breadcrumb"] = "Marka Ekle";

        return View(new BrandCreateViewModel());
    }

    // ── 3. POST: /Brand/Create (Yeni Marka Ekleme İşlemi) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(BrandCreateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        using var content = new MultipartFormDataContent();
        content.Add(new StringContent(model.Name ?? ""), "Name");

        // Dosya varsa Multipart'a ekle
        if (model.LogoFile != null && model.LogoFile.Length > 0)
        {
            var fileContent = new StreamContent(model.LogoFile.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(model.LogoFile.ContentType);
            content.Add(fileContent, "LogoFile", model.LogoFile.FileName);
        }

        var response = await _apiService.PostMultipartAsync<int>("api/Brand", content);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Marka başarıyla eklendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Marka eklenirken bir hata oluştu.";
        return View(model);
    }

    // ── 4. GET: /Brand/Edit/{id} (Marka Düzenleme Formu) ──
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        ViewData["Title"] = "Marka Düzenle";
        ViewData["Breadcrumb"] = "Marka Düzenle";

        var response = await _apiService.GetAsync<BrandDto>($"api/Brand/{id}");

        if (response == null || !response.Success || response.Data == null)
        {
            TempData["ErrorMessage"] = "Güncellenecek marka bulunamadı.";
            return RedirectToAction(nameof(Index));
        }

        var brand = response.Data;
        var model = new BrandUpdateViewModel
        {
            Id = brand.Id,
            Name = brand.Name,
            CurrentLogoUrl = string.IsNullOrEmpty(brand.LogoUrl) || brand.LogoUrl.StartsWith("http") 
                              ? brand.LogoUrl 
                              : $"{_apiBaseUrl.TrimEnd('/')}{brand.LogoUrl}"
        };

        return View(model);
    }

    // ── 5. POST: /Brand/Edit/{id} (Marka Güncelleme İşlemi) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(BrandUpdateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        using var content = new MultipartFormDataContent();
        content.Add(new StringContent(model.Id.ToString()), "Id");
        content.Add(new StringContent(model.Name ?? ""), "Name");

        // Dosya varsa Multipart'a ekle
        if (model.LogoFile != null && model.LogoFile.Length > 0)
        {
            var fileContent = new StreamContent(model.LogoFile.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(model.LogoFile.ContentType);
            content.Add(fileContent, "LogoFile", model.LogoFile.FileName);
        }

        var response = await _apiService.PutMultipartAsync<object>($"api/Brand/{model.Id}", content);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Marka başarıyla güncellendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Güncelleme sırasında hata oluştu.";
        return View(model);
    }

    // ── 6. POST: /Brand/Delete/{id} (Marka Silme İşlemi) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/Brand/{id}");

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Marka başarıyla silindi.";
        }
        else
        {
            TempData["ErrorMessage"] = response?.Message ?? "Marka silinemedi. (Belki bu markaya ait araçlar vardır?)";
        }

        return RedirectToAction(nameof(Index));
    }

    // ── 7. EXCEL ÇIKTISI ──
    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<IEnumerable<BrandDto>>("api/Brand/All");
        var brands = response?.Data?.ToList() ?? new List<BrandDto>();

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Marka Listesi");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Marka Adı";

            var headerRange = worksheet.Range("A1:B1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            int row = 2;
            foreach (var item in brands)
            {
                worksheet.Cell(row, 1).Value = item.Id;
                worksheet.Cell(row, 2).Value = item.Name;
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                var content = stream.ToArray();
                var fileName = $"Markalar_{DateTime.Now:ddMMyyyy}.xlsx";

                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }
    }
}