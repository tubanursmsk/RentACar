using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using RentACar.AdminPanel.Models;
using RentACar.AdminPanel.Services;

namespace RentACar.AdminPanel.Controllers;

[Route("Auth")]
public class AuthController : Controller
{
    private readonly BaseApiService _apiService;

    public AuthController(BaseApiService apiService)
    {
        _apiService = apiService;
    }

    // GET /Auth/Login
    [HttpGet("Login")]
    public IActionResult Login()
    {
        // Zaten giriş yapılmışsa dashboard'a yönlendir
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToAction("Index", "Dashboard");

        return View();
    }

    // POST /Auth/Login
    [HttpPost("Login")]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        // 1. API'ye login isteği at — PostAsync<TRequest, TResponse>
        var response = await _apiService.PostAsync<LoginViewModel, string>("api/Auth/Login", model);

        if (response == null || !response.Success || string.IsNullOrEmpty(response.Data))
        {
            ModelState.AddModelError("", response?.Message ?? "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
            return View(model);
        }

        var jwtToken = response.Data;

        // 2. JWT'yi Cookie'ye yaz — BaseApiService buradan okuyacak
        Response.Cookies.Append("JwtToken", jwtToken, new CookieOptions
        {
            HttpOnly = true,       // JS erişemez — XSS koruması
            Secure = false,        // Geliştirme ortamı için false; prod'da true yapın
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddHours(1)
        });

        // 3. JWT'yi parse edip MVC Cookie Auth için Claims oluştur
        //    Bu sayede [Authorize(Roles="Admin")] gibi attribute'lar çalışır
        var claims = ParseClaimsFromJwt(jwtToken);

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
        };

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authProperties
        );

        return RedirectToAction("Index", "Dashboard");
    }

    // GET /Auth/Logout
    [HttpGet("Logout")]
    public async Task<IActionResult> Logout()
    {
        // MVC Cookie'sini temizle
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        // JWT Cookie'sini de sil
        Response.Cookies.Delete("JwtToken");

        return RedirectToAction("Login");
    }

    // GET /Auth/AccessDenied
    [HttpGet("AccessDenied")]
    public IActionResult AccessDenied() => View();

    // JWT string'inden claim'leri parse eder — API'ye gitmeden roller okunur
    private static IEnumerable<Claim> ParseClaimsFromJwt(string jwt)
    {
        var handler = new JwtSecurityTokenHandler();

        if (!handler.CanReadToken(jwt))
            return Enumerable.Empty<Claim>();

        var token = handler.ReadJwtToken(jwt);
        return token.Claims;
    }
}