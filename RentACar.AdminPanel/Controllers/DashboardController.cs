using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;

namespace RentACar.AdminPanel.Controllers;

[Authorize]
public class DashboardController : Controller
{
    private readonly BaseApiService _apiService;

    public DashboardController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    // YENİ EKLENEN KÖPRÜ METODU (AJAX İçin)
    [HttpGet]
    public async Task<IActionResult> GetData()
    {
        // BaseApiService bizim yerimize Token'ı ekleyip API'nin 5065 portuna gidiyor!
        var response = await _apiService.GetAsync<object>("api/Dashboard/Overview");
        
        // Gelen veriyi JavaScript'in okuyabilmesi için doğrudan JSON olarak dönüyoruz
        return Json(response);
    }

    // Hata sayfası için ResponseCache ayarları
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    [AllowAnonymous] // Hata sayfası yetki istemesin
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}