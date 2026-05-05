using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;

namespace RentACar.AdminPanel.Controllers;

[Authorize(Roles = "Admin,CompanyManager,Staff")]
public class AdditionalServiceController : Controller
{
    private readonly BaseApiService _apiService;

    public AdditionalServiceController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    [HttpGet]
    public async Task<IActionResult> Index()
    {
        ViewData["Title"] = "Ek Hizmetler";
        ViewData["Breadcrumb"] = "Ek Hizmetler";

        var model = new AdditionalServiceListViewModel();
        var response = await _apiService.GetAsync<IEnumerable<AdditionalServiceViewModel>>("api/AdditionalService/All");

        if (response != null && response.Success && response.Data != null)
        {
            model.Services = response.Data.ToList();
        }

        return View(model);
    }

    [HttpGet]
    public IActionResult Create()
    {
        ViewData["Title"] = "Yeni Ek Hizmet";
        ViewData["Breadcrumb"] = "Yeni Ek Hizmet";
        return View(new AdditionalServiceCreateViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(AdditionalServiceCreateViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        // Listeyi virgülle birleştirip API'nin beklediği metne çeviriyoruz (Örn: "Economy,Luxury")
        var dto = new
        {
            Name = model.Name,
            DailyPrice = model.DailyPrice,
            CarSegment = model.SelectedSegments.Contains("All") ? "All" : string.Join(",", model.SelectedSegments)
        };

        var response = await _apiService.PostAsync<object, object>("api/AdditionalService", dto);

        if (response != null) // Başarılı varsayıyoruz
        {
            TempData["SuccessMessage"] = "Ek hizmet başarıyla eklendi.";
            return RedirectToAction(nameof(Index));
        }

        TempData["ErrorMessage"] = "Kayıt sırasında hata oluştu.";
        return View(model);
    }

    [HttpGet]
    public async Task<IActionResult> Edit(int id)
    {
        ViewData["Title"] = "Ek Hizmet Düzenle";
        ViewData["Breadcrumb"] = "Ek Hizmet Düzenle";

        var response = await _apiService.GetAsync<IEnumerable<AdditionalServiceViewModel>>("api/AdditionalService/All");
        var service = response?.Data?.FirstOrDefault(s => s.Id == id);

        if (service == null) return RedirectToAction(nameof(Index));

        var model = new AdditionalServiceEditViewModel
        {
            Id = service.Id,
            Name = service.Name,
            DailyPrice = service.DailyPrice,
            // Veritabanındaki virgüllü metni tekrar Listeye çevirip ekrana basıyoruz
            SelectedSegments = string.IsNullOrEmpty(service.CarSegment) ? new List<string>() : service.CarSegment.Split(',').ToList()
        };

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(AdditionalServiceEditViewModel model)
    {
        if (!ModelState.IsValid) return View(model);

        var dto = new
        {
            Id = model.Id,
            Name = model.Name,
            DailyPrice = model.DailyPrice,
            CarSegment = model.SelectedSegments.Contains("All") ? "All" : string.Join(",", model.SelectedSegments)
        };

        var response = await _apiService.PutAsync<object, object>($"api/AdditionalService/{model.Id}", dto);

        if (response != null)
        {
            TempData["SuccessMessage"] = "Ek hizmet güncellendi.";
            return RedirectToAction(nameof(Index));
        }

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(int id)
    {
        var response = await _apiService.DeleteAsync($"api/AdditionalService/{id}");

        if (response != null && response.Success) TempData["SuccessMessage"] = "Ek hizmet silindi.";
        else TempData["ErrorMessage"] = response?.Message ?? "Silme işlemi başarısız.";

        return RedirectToAction(nameof(Index));
    }
}