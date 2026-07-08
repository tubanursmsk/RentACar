using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.Interfaces;
using System.Security.Claims;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    // ── FİYAT PREVIEW (public — kullanıcı login olmadan da fiyat görür) ──
    [HttpPost("PricePreview")]
    [AllowAnonymous]
    public async Task<IActionResult> PricePreview([FromBody] PricePreviewRequestDto request)
    {
        var result = await _reservationService.CalculatePricePreviewAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── REZERVASYON OLUŞTUR (login zorunlu) ──
    [HttpPost("Create")]
    [Authorize(Roles = "Customer,Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto dto)
    {
        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _reservationService.CreateReservationAsync(currentUserId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── DETAY (ödeme/başarı sayfaları için) ──
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Customer,Admin,CompanyManager,Staff")]
    public async Task<IActionResult> GetDetail(int id)
    {
        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _reservationService.GetReservationDetailAsync(id, currentUserId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    
// ═══════════════════════════════════════════════════════════════════
// GET /api/Reservation/MyReservations?filter=active|past|cancelled
// Kullanıcının kendi rezervasyonları — filtreli
// ═══════════════════════════════════════════════════════════════════
[HttpGet("MyReservations")]
[Authorize(Roles = "Customer,Admin,CompanyManager,Staff")]
public async Task<IActionResult> GetMyReservations([FromQuery] string? filter = null)
{
    int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var result = await _reservationService.GetMyReservationsAsync(currentUserId, filter);
    return result.Success ? Ok(result) : BadRequest(result);
}
 
// ═══════════════════════════════════════════════════════════════════
// PUT /api/Reservation/{id}/Cancel
// Rezervasyonu iptal et (24 saat kaldıysa hata)
// ═══════════════════════════════════════════════════════════════════
[HttpPut("{id:int}/Cancel")]
[Authorize(Roles = "Customer,Admin,CompanyManager,Staff")]
public async Task<IActionResult> CancelMyReservation(int id, [FromBody] CancelReservationDto dto)
{
    int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var result = await _reservationService.CancelMyReservationAsync(id, currentUserId, dto);
    return result.Success ? Ok(result) : BadRequest(result);
}
 
// ═══════════════════════════════════════════════════════════════════
// PUT /api/Reservation/{id}/UpdateDates
// Rezervasyonun tarihlerini güncelle (fiyat yeniden hesaplanır)
// ═══════════════════════════════════════════════════════════════════
[HttpPut("{id:int}/UpdateDates")]
[Authorize(Roles = "Customer,Admin,CompanyManager,Staff")]
public async Task<IActionResult> UpdateMyReservationDates(int id, [FromBody] UpdateReservationDatesDto dto)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);
 
    int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var result = await _reservationService.UpdateMyReservationDatesAsync(id, currentUserId, dto);
    return result.Success ? Ok(result) : BadRequest(result);
}
 
}