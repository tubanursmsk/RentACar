using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.Interfaces;
using System.Security.Claims;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Kiralama işlemleri için giriş yapmak zorunlu
public class RentalController : ControllerBase
{
    private readonly IRentalService _rentalService;
    public RentalController(IRentalService rentalService) => _rentalService = rentalService;

    [HttpPost("Create")]
    [Authorize(Roles = "Customer,Staff,Admin")]
    public async Task<IActionResult> Create([FromBody] RentalCreateDto dto)
    {
        // JWT Token içindeki NameIdentifier (Kullanıcı ID'si) bilgisini alıyoruz.
        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var result = await _rentalService.CreateRentalAsync(currentUserId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("MyRentals")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyRentals()
    {
        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _rentalService.GetMyRentalsAsync(currentUserId));
    }

    [HttpPut("Approve/{rentalId}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Approve(int rentalId)
    {
        return Ok(await _rentalService.ApproveRentalAsync(rentalId));
    }

    [HttpPut("Complete/{rentalId}")]
    [Authorize(Roles = "Staff,Admin")]
    public async Task<IActionResult> Complete(int rentalId)
    {
        return Ok(await _rentalService.CompleteRentalAsync(rentalId));
    }
}