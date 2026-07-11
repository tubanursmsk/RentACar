using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Payment;
using RentACar.Application.Interfaces;
using System.Security.Claims;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _config;

    public PaymentController(IPaymentService paymentService, IConfiguration config)
    {
        _paymentService = paymentService;
        _config = config;
    }

    /// <summary>
    /// 3DS ödeme akışını başlatır. Kart bilgilerini alır, Iyzico'ya gönderir,
    /// dönen HTML content'i frontend'e verir.
    /// </summary>
    [HttpPost("InitThreeDS")]
    [Authorize]
    public async Task<IActionResult> InitThreeDS([FromBody] InitPaymentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        int currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _paymentService.InitThreeDSPaymentAsync(currentUserId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Iyzico'nun 3DS akışı sonunda çağırdığı callback.
    /// FormData olarak gelir. Frontend'in success sayfasına yönlendirir.
    /// </summary>
    [HttpPost("ThreeDSCallback")]
    [AllowAnonymous]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> ThreeDSCallback([FromForm] ThreeDSCallbackDto dto)
    {
        var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:4200";

        var result = await _paymentService.ProcessThreeDSCallbackAsync(dto);

        if (result.Success)
        {
            // Başarılı — Frontend başarı sayfasına yönlendir
            return Redirect($"{frontendUrl}/odeme-sonuc?status=success&rentalId={result.Data}");
        }
        else
        {
            // Başarısız — Frontend hata sayfasına yönlendir
            var errorMsg = Uri.EscapeDataString(result.Message ?? "Ödeme başarısız");
            return Redirect($"{frontendUrl}/odeme-sonuc?status=failed&message={errorMsg}");
        }
    }
}