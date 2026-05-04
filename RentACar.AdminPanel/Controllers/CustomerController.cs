using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.Customer;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,CompanyManager,Staff")] 
public class CustomerController : Controller
{
    private readonly BaseApiService _apiService;

    public CustomerController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

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

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        // Yalnızca Admin veya Şube Yöneticisi müşteri silebilir kısıtlaması ekleyebilirsin
        var response = await _apiService.DeleteAsync($"api/Customer/{id}");

        if (response != null && response.Success) TempData["SuccessMessage"] = "Müşteri sistemden silindi.";
        else TempData["ErrorMessage"] = response?.Message ?? "Müşteri silinemedi (Aktif kiralaması olabilir).";

        return RedirectToAction(nameof(Index));
    }

    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        // ... (Önceki mesajdaki ExportExcel kodunun aynısı kalacak)
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