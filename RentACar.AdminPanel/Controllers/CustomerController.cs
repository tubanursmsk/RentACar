using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Customer;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,CompanyManager,Staff")] // İş mantığımıza göre herkes erişebilir
public class CustomerController : Controller
{
    private readonly BaseApiService _apiService;

    public CustomerController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    // ── 1. GET: /Customer (Müşteri Listesi) ──
    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewData["Title"] = "Müşteri Yönetimi";
        ViewData["Breadcrumb"] = "Müşteriler";

        var model = new CustomerListViewModel();

        var response = await _apiService.GetAsync<IEnumerable<CustomerDto>>("api/Customer/All");
        if (response != null && response.Success && response.Data != null)
        {
            model.Customers = response.Data.ToList();
        }

        return View(model);
    }

    // ── 2. GET: /Customer/Edit/{id} (Düzenleme Formu) ──
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        ViewData["Title"] = "Müşteri Düzenle";
        ViewData["Breadcrumb"] = "Müşteri Düzenle";

        var response = await _apiService.GetAsync<CustomerDto>($"api/Customer/{id}");
        
        if (response == null || !response.Success || response.Data == null)
        {
            TempData["ErrorMessage"] = "Güncellenecek müşteri bulunamadı.";
            return RedirectToAction(nameof(Index));
        }

        var customer = response.Data;
        var model = new CustomerUpdateViewModel
        {
            Id = customer.Id,
            UserId = customer.UserId,
            FullName = customer.FullName,
            IdentityNumber = customer.IdentityNumber,
            Phone = customer.Phone,
            DateOfBirth = customer.DateOfBirth,
            FindeksScore = customer.FindeksScore
        };

        return View(model);
    }

    // ── 3. POST: /Customer/Edit/{id} ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(CustomerUpdateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var dto = new CustomerUpdateDto
        {
            UserId = model.UserId,
            IdentityNumber = model.IdentityNumber,
            Phone = model.Phone,
            DateOfBirth = model.DateOfBirth,
            FindeksScore = model.FindeksScore
        };

        var response = await _apiService.PutAsync<CustomerUpdateDto, object>($"api/Customer/{model.Id}", dto);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Müşteri bilgileri başarıyla güncellendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Güncelleme sırasında hata oluştu.";
        return View(model);
    }

    // ── 4. EXCEL ÇIKTISI ──
    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<IEnumerable<CustomerDto>>("api/Customer/All");
        var customers = response?.Data?.ToList() ?? new List<CustomerDto>();

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Müşteriler");

            worksheet.Cell(1, 1).Value = "Müşteri No";
            worksheet.Cell(1, 2).Value = "Ad Soyad";
            worksheet.Cell(1, 3).Value = "TC Kimlik No";
            worksheet.Cell(1, 4).Value = "Telefon";
            worksheet.Cell(1, 5).Value = "Doğum Tarihi";
            worksheet.Cell(1, 6).Value = "Findeks Puanı";

            var headerRange = worksheet.Range("A1:F1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            int row = 2;
            foreach (var item in customers)
            {
                worksheet.Cell(row, 1).Value = item.Id;
                worksheet.Cell(row, 2).Value = item.FullName;
                worksheet.Cell(row, 3).Value = item.IdentityNumber;
                worksheet.Cell(row, 4).Value = item.Phone;
                worksheet.Cell(row, 5).Value = item.DateOfBirth.ToString("dd.MM.yyyy");
                worksheet.Cell(row, 6).Value = item.FindeksScore;
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Musteriler_{DateTime.Now:ddMMyyyy}.xlsx");
            }
        }
    }
}