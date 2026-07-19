using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;
using RentACar.Application.DTOs.Auth;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IAuthService authService, IWebHostEnvironment environment)
    {
        _authService = authService;
        _environment = environment;
    }

    /// <summary>
    /// Cross-origin cookie ayarları:
    /// - Development: HTTP + same-origin → Secure=false, SameSite=Lax
    /// - Production/Ngrok: HTTPS + cross-origin → Secure=true, SameSite=None
    /// </summary>
    private CookieOptions BuildCookieOptions()
    {
        var isProduction = !_environment.IsDevelopment();

        return new CookieOptions
        {
            HttpOnly = true,   // XSS koruması - JavaScript okuyamaz
            Secure = isProduction,   // Production'da HTTPS zorunlu
            SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTime.UtcNow.AddDays(1)
        };
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);

        // Giriş başarılıysa JWT'yi HttpOnly cookie olarak yaz
        if (result.Success && !string.IsNullOrEmpty(result.Data))
        {
            Response.Cookies.Append("RentACarAuth", result.Data, BuildCookieOptions());
        }

        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("Logout")]
    public IActionResult Logout()
    {
        // ⚠️ KRİTİK: Silme de aynı ayarlarla olmalı, yoksa tarayıcı cookie'yi silmez!
        Response.Cookies.Delete("RentACarAuth", BuildCookieOptions());

        return Ok(new { success = true, message = "Başarıyla çıkış yapıldı." });
    }

    [HttpPost("RegisterCompany")]
    public async Task<IActionResult> RegisterCompany(RegisterCompanyDto dto)
    {
        var result = await _authService.RegisterWithCompanyAsync(dto);
        return Ok(result);
    }

    [HttpPost("RegisterCustomer")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterCustomer(RegisterCustomerDto dto)
    {
        var result = await _authService.RegisterCustomerAsync(dto);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("ChangePassword")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        if (dto.UserId != currentUserId) return Forbid();

        var result = await _authService.ChangePasswordAsync(dto);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("Me")]
    public async Task<IActionResult> GetMe([FromServices] IUserService userService)
    {
        var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserIdStr)) return Unauthorized();

        var result = await userService.GetUserByIdAsync(int.Parse(currentUserIdStr));
        return Ok(result);
    }
}