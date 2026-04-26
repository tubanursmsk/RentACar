using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;

namespace RentACar.AdminPanel.Controllers
{
    public class AuthController : Controller
    {
        private readonly BaseApiService _apiService;

        public AuthController(BaseApiService apiService)
        {
            _apiService = apiService;
        }

        [HttpGet]
        [Route("Login")]
        public IActionResult Login() => View();

        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            // API'ye login isteği atıyoruz
            var response = await _apiService.PostAsync<ApiResponse<string>>("api/Auth/Login", model);

            if (response != null && response.Success)
            {
                // Token'ı Session'a kaydediyoruz (BaseApiService buradan okuyacak)
                HttpContext.Session.SetString("JWToken", response.Data);
                
                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError("", response?.Message ?? "Giriş başarısız.");
            return View(model);
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("JWToken");
            return RedirectToAction("Login");
        }
    }
}
/* 

Özetle Mantık Şöyle İşler:
Giriş: Kllanıcı MVC'ye yazar -> MVC API'ye sorar.
Yanıt: API bir JWT verir.
Parselleme: MVC bu JWT'yi açar; "Ha bu adam Admin'miş, şirketi de X'miş" der ve bunu kendi Cookie'sine yazar.
Kullanım: Sen yarın bir sayfaya [Authorize(Roles="Admin")] yazdığında, MVC API'ye gitmez, kendi Cookie'sine bakar.
Servis: Bir veri istediğinde BaseApiService devreye girer, "Dur, şu JWT'yi de yanıma alayım da API beni tanısın" der.

*/