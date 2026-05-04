using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.User;
using ClosedXML.Excel;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin")] // Kullanıcı yönetimi sadece Admin'de olmalı
public class UserController : Controller
{
    private readonly BaseApiService _apiService;

    public UserController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    // ── 1. GET: /User (Kullanıcı Listesi) ──
    [HttpGet]
    public async Task<IActionResult> Index(int page = 1, int pageSize = 10)
    {
        ViewData["Title"] = "Kullanıcı Yönetimi";
        ViewData["Breadcrumb"] = "Kullanıcılar";

        var model = new UserListViewModel();
        model.Users.PageNumber = page;
        model.Users.PageSize = pageSize;

        try
        {
            var response = await _apiService.GetAsync<RentACar.Application.DTOs.Responses.PaginatedResult<UserDto>>(
                $"api/User/Paged?pageNumber={page}&pageSize={pageSize}");

            if (response != null && response.Success && response.Data != null)
            {
                model.Users.Items = response.Data.Items.ToList();
                model.Users.TotalCount = response.Data.TotalCount;
            }
        }
        catch (System.Text.Json.JsonException)
        {
            var listResponse = await _apiService.GetAsync<IEnumerable<UserDto>>(
                $"api/User/Paged?pageNumber={page}&pageSize={pageSize}");

            if (listResponse != null && listResponse.Success && listResponse.Data != null)
            {
                model.Users.Items = listResponse.Data.ToList();
                model.Users.TotalCount = listResponse.Data.Count();
            }
        }

        return View(model);
    }

    // ── 2. GET: /User/Create (Yeni Kullanıcı Formu) ──
    [HttpGet]
    public IActionResult Create()
    {
        ViewData["Title"] = "Kullanıcı Ekle";
        ViewData["Breadcrumb"] = "Kullanıcı Ekle";
        return View(new UserCreateViewModel());
    }

    // ── 3. POST: /User/Create ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(UserCreateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var dto = new UserCreateDto
        {
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email,
            Password = model.Password,
            Role = model.Role
        };

        // NOT: API'de bu endpointin oluşturulduğunu varsayıyoruz
        var response = await _apiService.PostAsync<UserCreateDto, int>("api/User", dto);

        if (response != null && response.Success)
        {
            TempData["SuccessMessage"] = "Kullanıcı başarıyla eklendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = response?.Message ?? "Kullanıcı eklenirken hata oluştu.";
        return View(model);
    }

    // ── 4. GET: /User/Edit/{id} ──
    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        ViewData["Title"] = "Kullanıcı Düzenle";
        ViewData["Breadcrumb"] = "Kullanıcı Düzenle";

        var response = await _apiService.GetAsync<UserDto>($"api/User/{id}");
        if (response == null || !response.Success || response.Data == null)
        {
            TempData["ErrorMessage"] = "Kullanıcı bulunamadı.";
            return RedirectToAction(nameof(Index));
        }

        var model = new UserUpdateViewModel
        {
            Id = response.Data.Id,
            FirstName = response.Data.FirstName,
            LastName = response.Data.LastName,
            Email = response.Data.Email,
            Role = response.Data.Role
        };

        return View(model);
    }

    // ── 5. POST: /User/Edit/{id} ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(UserUpdateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        // 1. Profil Bilgilerini Güncelle (API'deki UpdateProfile)
        var profileDto = new UserUpdateDto
        {
            Id = model.Id,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email
        };
        var profileResponse = await _apiService.PutAsync<UserUpdateDto, object>($"api/User/UpdateProfile/{model.Id}", profileDto);

        // 2. Rolü Güncelle (API'deki AssignRole)
        // API'deki [Required] etiketlerine takılmamak için formdaki diğer bilgileri de DTO'ya ekliyorum.
        var roleDto = new UserDto
        {
            Id = model.Id,
            Role = model.Role,
            FirstName = model.FirstName,
            LastName = model.LastName,
            Email = model.Email
        };
        var roleResponse = await _apiService.PostAsync<UserDto, object>("api/User/AssignRole", roleDto);

        if (profileResponse != null && profileResponse.Success)
        {
            TempData["SuccessMessage"] = "Kullanıcı bilgileri ve yetkileri güncellendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = profileResponse?.Message ?? "Güncelleme sırasında hata oluştu.";
        return View(model);
    }

    // ── 6. POST: /User/Delete/{id} ──
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/User/{id}");

        if (response != null && response.Success) TempData["SuccessMessage"] = "Kullanıcı silindi.";
        else TempData["ErrorMessage"] = response?.Message ?? "Silme işlemi başarısız.";

        return RedirectToAction(nameof(Index));
    }

    // ── 7. EXCEL ÇIKTISI ──
    [HttpGet]
    public async Task<IActionResult> ExportExcel()
    {
        var response = await _apiService.GetAsync<IEnumerable<UserDto>>("api/User/All");
        var users = response?.Data?.ToList() ?? new List<UserDto>();

        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("Kullanıcılar");

            worksheet.Cell(1, 1).Value = "Ad";
            worksheet.Cell(1, 2).Value = "Soyad";
            worksheet.Cell(1, 3).Value = "E-Posta";
            worksheet.Cell(1, 4).Value = "Rol / Yetki";
            worksheet.Cell(1, 5).Value = "Kayıt Tarihi";

            var headerRange = worksheet.Range("A1:E1");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            int row = 2;
            foreach (var item in users)
            {
                worksheet.Cell(row, 1).Value = item.FirstName;
                worksheet.Cell(row, 2).Value = item.LastName;
                worksheet.Cell(row, 3).Value = item.Email;
                worksheet.Cell(row, 4).Value = item.Role;
                worksheet.Cell(row, 5).Value = item.CreatedDate.ToString("dd.MM.yyyy");
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Kullanicilar_{DateTime.Now:ddMMyyyy}.xlsx");
            }
        }
    }
}