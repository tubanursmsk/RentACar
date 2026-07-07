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
    private readonly IConfiguration _configuration;
    private readonly string _apiBaseUrl;

    public CarController(BaseApiService apiService, IConfiguration configuration)
    {
        _apiService = apiService;
        _configuration = configuration;
        _apiBaseUrl = _configuration["ApiSettings:BaseUrl"] ?? "http://localhost:5065/";
    }

    private async Task LoadViewBags()
    {
        var brandResponse = await _apiService.GetAsync<IEnumerable<BrandDto>>("api/Brand/All");
        var locationResponse = await _apiService.GetAsync<IEnumerable<LocationDto>>("api/Location/All");

        ViewBag.AllBrands = brandResponse?.Data?.ToList() ?? new List<BrandDto>();
        ViewBag.AllLocations = locationResponse?.Data?.ToList() ?? new List<LocationDto>();
    }

    // ── HELPER: Yeni alanları form data'ya ekle ──
    private void AddCarSpecFieldsToContent(MultipartFormDataContent content, dynamic model)
    {
        // Araç özellikleri
        content.Add(new StringContent(((int)model.FuelType).ToString()), "FuelType");
        content.Add(new StringContent(((int)model.TransmissionType).ToString()), "TransmissionType");
        content.Add(new StringContent(((int)model.SeatCount).ToString()), "SeatCount");
        content.Add(new StringContent(((int)model.DoorCount).ToString()), "DoorCount");
        content.Add(new StringContent(((int)model.LuggageCount).ToString()), "LuggageCount");

        if (!string.IsNullOrEmpty((string?)model.Color))
            content.Add(new StringContent((string)model.Color), "Color");

        if (model.Mileage != null)
            content.Add(new StringContent(((int)model.Mileage).ToString()), "Mileage");

        if (!string.IsNullOrEmpty((string?)model.Description))
            content.Add(new StringContent((string)model.Description), "Description");

        // Ek özellikler (bool → "true"/"false")
        content.Add(new StringContent(((bool)model.HasAirbag).ToString().ToLower()), "HasAirbag");
        content.Add(new StringContent(((bool)model.HasAbs).ToString().ToLower()), "HasAbs");
        content.Add(new StringContent(((bool)model.HasAirConditioning).ToString().ToLower()), "HasAirConditioning");
        content.Add(new StringContent(((bool)model.HasBluetooth).ToString().ToLower()), "HasBluetooth");
        content.Add(new StringContent(((bool)model.HasNavigation).ToString().ToLower()), "HasNavigation");

        // Kiralama koşulları
        content.Add(new StringContent(((int)model.MinDriverAge).ToString()), "MinDriverAge");
        content.Add(new StringContent(((int)model.MinLicenseYears).ToString()), "MinLicenseYears");
    }

    // ── ARAÇ LİSTESİ ──
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 10)
    {
        var model = new CarListViewModel();
        model.Cars.PageNumber = page;
        model.Cars.PageSize = pageSize;

        try
        {
            var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<CarDto>>(
                $"api/Car/Paged?pageNumber={page}&pageSize={pageSize}");

            if (response != null && response.Success && response.Data != null)
            {
                var cars = response.Data.Items.ToList();

                foreach (var car in cars)
                {
                    if (!string.IsNullOrEmpty(car.ImageUrl) && !car.ImageUrl.StartsWith("http"))
                    {
                        car.ImageUrl = $"{_apiBaseUrl.TrimEnd('/')}{car.ImageUrl}";
                    }
                }

                model.Cars.Items = cars;
                model.Cars.TotalCount = response.Data.TotalCount;
            }
        }
        catch (System.Text.Json.JsonException)
        {
            var listResponse = await _apiService.GetAsync<IEnumerable<CarDto>>(
                $"api/Car/Paged?pageNumber={page}&pageSize={pageSize}");

            if (listResponse != null && listResponse.Success && listResponse.Data != null)
            {
                var cars = listResponse.Data.ToList();

                foreach (var car in cars)
                {
                    if (!string.IsNullOrEmpty(car.ImageUrl) && !car.ImageUrl.StartsWith("http"))
                    {
                        car.ImageUrl = $"{_apiBaseUrl.TrimEnd('/')}{car.ImageUrl}";
                    }
                }

                model.Cars.Items = cars;
                model.Cars.TotalCount = cars.Count;
            }
        }

        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Create()
    {
        await LoadViewBags();
        var model = new CreateViewModel();
        return View(model);
    }

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

        // Temel alanlar
        content.Add(new StringContent(viewModel.BrandId.ToString()), "BrandId");
        content.Add(new StringContent(viewModel.CurrentLocationId.ToString()), "CurrentLocationId");
        content.Add(new StringContent(viewModel.Model ?? ""), "Model");
        content.Add(new StringContent(viewModel.Year.ToString()), "Year");
        content.Add(new StringContent(viewModel.Plate ?? ""), "Plate");
        content.Add(new StringContent(viewModel.DailyPrice.ToString(CultureInfo.InvariantCulture)), "DailyPrice");
        content.Add(new StringContent(viewModel.MinFindeksScore.ToString()), "MinFindeksScore");
        content.Add(new StringContent(((int)viewModel.Status).ToString()), "Status");

        // Yeni alanlar
        AddCarSpecFieldsToContent(content, viewModel);

        // Fotoğraf
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

            // Yeni alanlar (backend'den gelen)
            FuelType = car.FuelType,
            TransmissionType = car.TransmissionType,
            SeatCount = car.SeatCount > 0 ? car.SeatCount : 5,
            DoorCount = car.DoorCount > 0 ? car.DoorCount : 4,
            LuggageCount = car.LuggageCount,
            Color = car.Color,
            Mileage = car.Mileage,
            Description = car.Description,

            HasAirbag = car.HasAirbag,
            HasAbs = car.HasAbs,
            HasAirConditioning = car.HasAirConditioning,
            HasBluetooth = car.HasBluetooth,
            HasNavigation = car.HasNavigation,

            MinFindeksScore = car.MinFindeksScore,
            MinDriverAge = car.MinDriverAge > 0 ? car.MinDriverAge : 21,
            MinLicenseYears = car.MinLicenseYears,

            Status = car.Status,
            CurrentImageUrl = string.IsNullOrEmpty(car.ImageUrl) || car.ImageUrl.StartsWith("http")
                              ? car.ImageUrl
                              : $"{_apiBaseUrl.TrimEnd('/')}{car.ImageUrl}"
        };

        return View(model);
    }

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

        // Temel alanlar
        content.Add(new StringContent(viewModel.Id.ToString()), "Id");
        content.Add(new StringContent(viewModel.BrandId.ToString()), "BrandId");
        content.Add(new StringContent(viewModel.CurrentLocationId.ToString()), "CurrentLocationId");
        content.Add(new StringContent(viewModel.Model ?? ""), "Model");
        content.Add(new StringContent(viewModel.Year.ToString()), "Year");
        content.Add(new StringContent(viewModel.Plate ?? ""), "Plate");
        content.Add(new StringContent(viewModel.DailyPrice.ToString(CultureInfo.InvariantCulture)), "DailyPrice");
        content.Add(new StringContent(viewModel.MinFindeksScore.ToString()), "MinFindeksScore");
        content.Add(new StringContent(((int)viewModel.Status).ToString()), "Status");

        // Yeni alanlar
        AddCarSpecFieldsToContent(content, viewModel);

        // Fotoğraf
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

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/Car/{id}");

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Araç başarıyla silindi.";
        }
        else
        {
            TempData["ErrorMessage"] = response?.Message ?? "Araç silinemedi.";
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<CarDto>>("api/Car/Paged?pageNumber=1&pageSize=1000");
        var cars = response?.Data?.Items?.ToList() ?? new List<CarDto>();

        using (var workbook = new XLWorkbook())
        {
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

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                var content = stream.ToArray();
                var fileName = $"Araclar_{DateTime.Now:ddMMyyyy}.xlsx";

                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
        }
    }
}