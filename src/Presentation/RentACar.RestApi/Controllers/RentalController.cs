using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.Interfaces;
using System.Security.Claims;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Bu controller altındaki her işlem giriş gerektirir
public class RentalController : ControllerBase
{
    private readonly IRentalService _rentalService;
    public RentalController(IRentalService rentalService) => _rentalService = rentalService;

    // ── 1. MÜŞTERİ İŞLEMLERİ ──

    [HttpPost("Create")]
    [Authorize(Roles = "Customer")] // Sadece müşteriler kendi adına kiralayabilir
    public async Task<IActionResult> Create([FromBody] RentalCreateDto dto)
    {
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


    // ── 2. ADMİN & PERSONEL İŞLEMLERİ ──

    [HttpPost("AdminCreate")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> AdminCreate([FromBody] RentalCreateDto dto)
    {
        // Admin, DTO içindeki CustomerId alanını dolu gönderecek.
        var result = await _rentalService.AdminCreateRentalAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("Paged")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await _rentalService.GetPagedRentalsAsync(pageNumber, pageSize));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> GetById(int id)
    {
        return Ok(await _rentalService.GetRentalByIdAsync(id));
    }

    // ── 3. DURUM (STATUS) GÜNCELLEMELERİ ──

    [HttpPut("Approve/{rentalId:int}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Approve(int rentalId)
    {
        return Ok(await _rentalService.ApproveRentalAsync(rentalId));
    }

    [HttpPut("Complete/{rentalId:int}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Complete(int rentalId)
    {
        return Ok(await _rentalService.CompleteRentalAsync(rentalId));
    }

    [HttpPut("Cancel/{rentalId:int}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Cancel(int rentalId)
    {
        return Ok(await _rentalService.CancelRentalAsync(rentalId));
    }

    // ── 4. SİLME İŞLEMİ ──

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        return Ok(await _rentalService.DeleteRentalAsync(id));
    }
}