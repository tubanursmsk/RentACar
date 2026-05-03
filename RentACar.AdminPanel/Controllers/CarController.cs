using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Responses;
using System.Globalization;
using System.Net.Http.Headers;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,CompanyManager,Staff")]
public class CarController : Controller
{
    private readonly BaseApiService _apiService;

    public CarController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    // ── Dropdown verisini çekmek için helper ──
    private async Task LoadViewBags()
    {
        var brandResponse = await _apiService.GetAsync<IEnumerable<BrandDto>>("api/Brand/All");
        var locationResponse = await _apiService.GetAsync<IEnumerable<LocationDto>>("api/Location/All");

        ViewBag.AllBrands = brandResponse?.Data?.ToList() ?? new List<BrandDto>();
        ViewBag.AllLocations = locationResponse?.Data?.ToList() ?? new List<LocationDto>();
    }

    // ── ARAÇ LİSTESİ ──
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 10)
    {
        var response = await _apiService.GetAsync<PaginatedResult<CarDto>>(
            $"api/Car/Paged?pageNumber={page}&pageSize={pageSize}");

        var viewModel = new CarListViewModel
        {
            Cars = new Models.PagedResult<CarDto>
            {
                Items = response?.Data?.Items ?? new List<CarDto>(),
                TotalCount = response?.Data?.TotalCount ?? 0,
                PageNumber = page,
                PageSize = pageSize
            }
        };

        return View(viewModel);
    }

    // ── YENİ ARAÇ EKLEME (GET) ──
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        await LoadViewBags();
        return View(new CreateViewModel());
    }

    // ── YENİ ARAÇ EKLEME (POST) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CreateViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            await LoadViewBags();
            return View(viewModel);
        }

        using var content = new MultipartFormDataContent();
        content.Add(new StringContent(viewModel.BrandId.ToString()), nameof(CarCreateDto.BrandId));
        content.Add(new StringContent(viewModel.CurrentLocationId.ToString()), nameof(CarCreateDto.CurrentLocationId));
        content.Add(new StringContent(viewModel.Model ?? ""), nameof(CarCreateDto.Model));
        content.Add(new StringContent(viewModel.Year.ToString()), nameof(CarCreateDto.Year));
        content.Add(new StringContent(viewModel.Plate ?? ""), nameof(CarCreateDto.Plate));
        content.Add(new StringContent(viewModel.DailyPrice.ToString(CultureInfo.InvariantCulture)),
            nameof(CarCreateDto.DailyPrice));
        content.Add(new StringContent(viewModel.MinFindeksScore.ToString()), nameof(CarCreateDto.MinFindeksScore));
        content.Add(new StringContent(((int)viewModel.Status).ToString()), nameof(CarCreateDto.Status));

        // ÖNEMLİ: DTO'da `ImageFiles` (List) field'ı için form name'i de "ImageFiles" olmalı
        if (viewModel.ImageFile != null && viewModel.ImageFile.Length > 0)
        {
            var fileContent = new StreamContent(viewModel.ImageFile.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(viewModel.ImageFile.ContentType);
            content.Add(fileContent, "ImageFiles", viewModel.ImageFile.FileName);
        }

        var response = await _apiService.PostMultipartAsync<int>("api/Car", content);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Araç başarıyla eklendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "API tarafında bir hata oluştu.";
        await LoadViewBags();
        return View(viewModel);
    }

    // ── ARAÇ GÜNCELLEME (GET) ──
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        var response = await _apiService.GetAsync<CarDto>($"api/Car/{id}");
        if (response == null || !response.Success || response.Data == null)
        {
            TempData["ErrorMessage"] = "Araç bulunamadı.";
            return RedirectToAction(nameof(Index));
        }

        await LoadViewBags();

        var car = response.Data;
        var model = new EditViewModel
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

        return View(model);
    }

    // ── ARAÇ GÜNCELLEME (POST) ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(EditViewModel viewModel)
    {
        if (!ModelState.IsValid)
        {
            await LoadViewBags();
            return View(viewModel);
        }

        using var content = new MultipartFormDataContent();
        content.Add(new StringContent(viewModel.Id.ToString()), nameof(CarUpdateDto.Id));
        content.Add(new StringContent(viewModel.BrandId.ToString()), nameof(CarUpdateDto.BrandId));
        content.Add(new StringContent(viewModel.CurrentLocationId.ToString()), nameof(CarUpdateDto.CurrentLocationId));
        content.Add(new StringContent(viewModel.Model ?? ""), nameof(CarUpdateDto.Model));
        content.Add(new StringContent(viewModel.Year.ToString()), nameof(CarUpdateDto.Year));
        content.Add(new StringContent(viewModel.Plate ?? ""), nameof(CarUpdateDto.Plate));
        content.Add(new StringContent(viewModel.DailyPrice.ToString(CultureInfo.InvariantCulture)),
            nameof(CarUpdateDto.DailyPrice));
        content.Add(new StringContent(viewModel.MinFindeksScore.ToString()), nameof(CarUpdateDto.MinFindeksScore));
        content.Add(new StringContent(((int)viewModel.Status).ToString()), nameof(CarUpdateDto.Status));

        // ImageFile gelmezse mevcut ImageUrl korunur (CarService'te yönetiliyor)
        if (viewModel.ImageFile != null && viewModel.ImageFile.Length > 0)
        {
            var fileContent = new StreamContent(viewModel.ImageFile.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(viewModel.ImageFile.ContentType);
            content.Add(fileContent, "ImageFiles", viewModel.ImageFile.FileName);
        }

        var response = await _apiService.PutMultipartAsync<object>($"api/Car/{viewModel.Id}", content);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Araç başarıyla güncellendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Güncelleme sırasında hata oluştu.";
        await LoadViewBags();
        return View(viewModel);
    }

    // ── ARAÇ SİLME ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/Car/{id}");

        if (response != null && response.Success)
            TempData["SuccessMessage"] = "Araç başarıyla silindi.";
        else
            TempData["ErrorMessage"] = response?.Message ?? "Araç silinemedi.";

        return RedirectToAction(nameof(Index));
    }

    // ── EXCEL EXPORT ──
    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<PaginatedResult<CarDto>>(
            "api/Car/Paged?pageNumber=1&pageSize=1000");
        var cars = response?.Data?.Items?.ToList() ?? new List<CarDto>();

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Araç Listesi");

        worksheet.Cell(1, 1).Value = "Marka";
        worksheet.Cell(1, 2).Value = "Model";
        worksheet.Cell(1, 3).Value = "Yıl";
        worksheet.Cell(1, 4).Value = "Plaka";
        worksheet.Cell(1, 5).Value = "Günlük Fiyat";
        worksheet.Cell(1, 6).Value = "Şube";
        worksheet.Cell(1, 7).Value = "Durum";

        var headerRange = worksheet.Range("A1:G1");
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        int row = 2;
        foreach (var item in cars)
        {
            worksheet.Cell(row, 1).Value = item.BrandName;
            worksheet.Cell(row, 2).Value = item.Model;
            worksheet.Cell(row, 3).Value = item.Year;
            worksheet.Cell(row, 4).Value = item.Plate;
            worksheet.Cell(row, 5).Value = item.DailyPrice;
            worksheet.Cell(row, 6).Value = item.CurrentLocationName;
            worksheet.Cell(row, 7).Value = item.Status.ToString();
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var fileName = $"Araclar_{DateTime.Now:ddMMyyyy}.xlsx";
        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}