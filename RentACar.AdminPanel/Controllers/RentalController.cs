using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Customer;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,CompanyManager,Staff")]
public class RentalController : Controller
{
    private readonly BaseApiService _apiService;

    public RentalController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    private async Task LoadViewBags()
    {
        // Araçlar (Tüm araçları sayfalama üzerinden geniş bir limitle çekiyoruz)
        var carsResponse = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<CarDto>>("api/Car/Paged?pageNumber=1&pageSize=1000");
        ViewBag.AllCars = carsResponse?.Data?.Items?.ToList() ?? new List<CarDto>();

        // Şubeler
        var locationsResponse = await _apiService.GetAsync<IEnumerable<LocationDto>>("api/Location/All");
        ViewBag.AllLocations = locationsResponse?.Data?.ToList() ?? new List<LocationDto>();

        // Müşteriler (Eğer Customer/All diye bir endpoint'in yoksa API'ye eklemen gerekebilir)
        var customersResponse = await _apiService.GetAsync<IEnumerable<CustomerDto>>("api/Customer/All");
        ViewBag.AllCustomers = customersResponse?.Data?.ToList() ?? new List<CustomerDto>();
    }

    // ── 1. GET: /Rental (Kiralama Listesi) ──
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 10)
    {
        ViewData["Title"] = "Kiralama Yönetimi";
        ViewData["Breadcrumb"] = "Kiralamalar";

        var model = new RentalListViewModel();
        model.Rentals.PageNumber = page;
        model.Rentals.PageSize = pageSize;

        try
        {
            var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<RentalDto>>(
                $"api/Rental/Paged?pageNumber={page}&pageSize={pageSize}");

            if (response != null && response.Success && response.Data != null)
            {
                model.Rentals.Items = response.Data.Items.ToList();
                model.Rentals.TotalCount = response.Data.TotalCount;
            }
        }
        catch (System.Text.Json.JsonException)
        {
            var listResponse = await _apiService.GetAsync<IEnumerable<RentalDto>>(
                $"api/Rental/Paged?pageNumber={page}&pageSize={pageSize}");

            if (listResponse != null && listResponse.Success && listResponse.Data != null)
            {
                model.Rentals.Items = listResponse.Data.ToList();
                model.Rentals.TotalCount = listResponse.Data.Count();
            }
        }

        return View(model);
    }

    // ── 2. GET: /Rental/Create (Yeni Kiralama Formu) ──
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        ViewData["Title"] = "Kiralama Ekle";
        ViewData["Breadcrumb"] = "Kiralama Ekle";

        await LoadViewBags();
        return View(new RentalCreateViewModel());
    }

    // ── 3. POST: /Rental/Create ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(RentalCreateViewModel model)
    {
        if (!ModelState.IsValid)
        {
            await LoadViewBags();
            return View(model);
        }

        var dto = new RentalCreateDto
        {
            CustomerId = model.CustomerId,
            CarId = model.CarId,
            PickUpLocationId = model.PickUpLocationId,
            DropOffLocationId = model.DropOffLocationId,
            RentStartDate = model.RentStartDate,
            RentEndDate = model.RentEndDate
        };

        var response = await _apiService.PostAsync<RentalCreateDto, int>("api/Rental/AdminCreate", dto);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Kiralama işlemi başarıyla oluşturuldu.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Kiralama oluşturulurken bir hata oluştu.";
        await LoadViewBags();
        return View(model);
    }

    // ── 4. DURUM GÜNCELLEMELERİ (STATE MACHINE) ──

    [HttpPost]
    public async Task<IActionResult> Approve(int id)
    {
        var response = await _apiService.PutAsync<object, bool>($"api/Rental/Approve/{id}", new { });
        if (response != null && response.Success) TempData["SuccessMessage"] = "Rezervasyon onaylandı.";
        else TempData["ErrorMessage"] = response?.Message ?? "İşlem başarısız.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Complete(int id)
    {
        var response = await _apiService.PutAsync<object, bool>($"api/Rental/Complete/{id}", new { });
        if (response != null && response.Success) TempData["SuccessMessage"] = "Araç teslim alındı ve kiralama tamamlandı.";
        else TempData["ErrorMessage"] = response?.Message ?? "İşlem başarısız.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Cancel(int id)
    {
        var response = await _apiService.PutAsync<object, bool>($"api/Rental/Cancel/{id}", new { });
        if (response != null && response.Success) TempData["SuccessMessage"] = "Kiralama iptal edildi.";
        else TempData["ErrorMessage"] = response?.Message ?? "İşlem başarısız.";
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/Rental/{id}");
        if (response != null && response.Success) TempData["SuccessMessage"] = "Kayıt başarıyla silindi.";
        else TempData["ErrorMessage"] = response?.Message ?? "Silme işlemi başarısız.";
        return RedirectToAction(nameof(Index));
    }

    // ── 5. EXCEL ÇIKTISI ──
    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<RentalDto>>("api/Rental/Paged?pageNumber=1&pageSize=1000");
        var rentals = response?.Data?.Items?.ToList() ?? new List<RentalDto>();

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Kiralamalar");

            worksheet.Cell(1, 1).Value = "Müşteri";
            worksheet.Cell(1, 2).Value = "Araç Bilgisi";
            worksheet.Cell(1, 3).Value = "Alış Şubesi";
            worksheet.Cell(1, 4).Value = "Dönüş Şubesi";
            worksheet.Cell(1, 5).Value = "Alış Tarihi";
            worksheet.Cell(1, 6).Value = "Dönüş Tarihi";
            worksheet.Cell(1, 7).Value = "Toplam Tutar";
            worksheet.Cell(1, 8).Value = "Durum";

            var headerRange = worksheet.Range("A1:H1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            int row = 2;
            foreach (var item in rentals)
            {
                worksheet.Cell(row, 1).Value = item.CustomerFullName;
                worksheet.Cell(row, 2).Value = item.CarInfo;
                worksheet.Cell(row, 3).Value = item.PickUpLocationName;
                worksheet.Cell(row, 4).Value = item.DropOffLocationName;
                worksheet.Cell(row, 5).Value = item.RentStartDate.ToString("dd.MM.yyyy HH:mm");
                worksheet.Cell(row, 6).Value = item.RentEndDate.ToString("dd.MM.yyyy HH:mm");
                worksheet.Cell(row, 7).Value = item.TotalAmount;
                worksheet.Cell(row, 8).Value = item.Status.ToString();
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                var content = stream.ToArray();
                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Kiralamalar_{DateTime.Now:ddMMyyyy}.xlsx");
            }
        }
    }
}