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
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateReservationDto dto)
    {
        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _reservationService.CreateReservationAsync(currentUserId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── DETAY (ödeme/başarı sayfaları için) ──
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetDetail(int id)
    {
        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _reservationService.GetReservationDetailAsync(id, currentUserId);
        return result.Success ? Ok(result) : NotFound(result);
    }
}