using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;
using RentACar.Application.DTOs.Auth;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

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
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("RegisterCompany")]
    public async Task<IActionResult> RegisterCompany(RegisterCompanyDto dto)
    {
        var result = await _authService.RegisterWithCompanyAsync(dto);
        return Ok(result);
    }

    [HttpPost("RegisterCustomer")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterCustomer(RegisterDto dto)
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