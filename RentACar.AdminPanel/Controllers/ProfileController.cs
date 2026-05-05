using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;
using RentACar.Application.DTOs.User;
using System.Security.Claims;

namespace RentACar.AdminPanel.Controllers;

[Authorize] // Sisteme giriş yapan herkes (Admin, Manager, Staff) profilini görebilir
public class ProfileController : Controller
{
    private readonly BaseApiService _apiService;

    public ProfileController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    // Mevcut giriş yapan kullanıcının ID'sini Claims'den okuyan yardımcı metot
    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? int.Parse(userIdClaim.Value) : 0;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewData["Title"] = "Profilim";
        ViewData["Breadcrumb"] = "Profilim";

        int userId = GetCurrentUserId();
        
        // API'den kullanıcının mevcut bilgilerini çekiyoruz
        var response = await _apiService.GetAsync<UserDto>($"api/User/{userId}");
        
        var model = new ProfileInfoViewModel();
        if (response != null && response.Success && response.Data != null)
        {
            model.Id = response.Data.Id;
            model.FirstName = response.Data.FirstName;
            model.LastName = response.Data.LastName;
            model.Email = response.Data.Email;
            model.Role = response.Data.Role;
        }

        // View'a iki modeli de ViewBag/ViewData üzerinden gönderebiliriz ama biz Tuple veya sadece Info'yu basacağız.
        // Şifre modeli post işlemi içindir.
        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateInfo(ProfileInfoViewModel model)
    {
        if (!ModelState.IsValid)
        {
            TempData["ErrorMessage"] = "Lütfen formdaki hataları düzeltin.";
            return View("Index", model);
        }

        int userId = GetCurrentUserId();
        model.Id = userId; // Güvenlik için ID'yi ez

        var response = await _apiService.PutAsync<ProfileInfoViewModel, object>($"api/User/UpdateProfile/{userId}", model);

        if (response != null && response.Success)
            TempData["SuccessMessage"] = "Profil bilgileriniz başarıyla güncellendi.";
        else
            TempData["ErrorMessage"] = response?.Message ?? "Güncelleme sırasında bir hata oluştu.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ChangePassword(ProfilePasswordViewModel model)
    {
        if (!ModelState.IsValid)
        {
            TempData["ErrorMessage"] = "Lütfen şifre kurallarına dikkat ediniz.";
            return RedirectToAction(nameof(Index));
        }

        int userId = GetCurrentUserId();

        var dto = new 
        {
            UserId = userId,
            CurrentPassword = model.CurrentPassword,
            NewPassword = model.NewPassword
        };

        var response = await _apiService.PostAsync<object, object>("api/Auth/ChangePassword", dto);

        if (response != null && response.Success)
            TempData["SuccessMessage"] = "Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.";
        else
            TempData["ErrorMessage"] = response?.Message ?? "Şifre değiştirme işlemi başarısız oldu. Mevcut şifrenizi kontrol ediniz.";

        return RedirectToAction(nameof(Index));
    }
}