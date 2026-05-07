using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;
using RentACar.Application.DTOs.Auth;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http; // CookieOptions için gerekli

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("Login")] 
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);
        
        // 1. EĞER GİRİŞ BAŞARILIYSA TOKEN'I COOKIE'YE YAZ (ANGULAR İÇİN)
        if (result.Success && !string.IsNullOrEmpty(result.Data))
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true, // JavaScript (Angular) okuyamaz, XSS saldırısı yapılamaz
                Secure = false,  // Localhost'ta çalıştığımız için şimdilik false. Canlıya çıkarken true olacak.
                SameSite = SameSiteMode.Strict, // CSRF saldırılarına karşı koruma
                Expires = DateTime.UtcNow.AddDays(1) // Token'ın süresiyle aynı olmalı (örneğin 1 gün)
            };

            // result.Data içinde IAuthService'den dönen JWT string'i var
            Response.Cookies.Append("RentACarAuth", result.Data, cookieOptions);
        }

        return result.Success ? Ok(result) : Unauthorized(result);
    }


    [HttpPost("Logout")]
    public IActionResult Logout()
    {
        // Güvenli çıkış için Cookie'yi siliyoruz
        Response.Cookies.Delete("RentACarAuth");
        
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
}