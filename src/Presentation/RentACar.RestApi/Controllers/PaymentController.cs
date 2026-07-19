using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Payment;
using RentACar.Application.Interfaces;
using System.Security.Claims;
using System.Text;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IConfiguration _config;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        IPaymentService paymentService,
        IConfiguration config,
        ILogger<PaymentController> logger)
    {
        _paymentService = paymentService;
        _config = config;
        _logger = logger;
    }

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
    /// Iyzico'nun 3DS callback'i. FormData olarak gelir.
    /// iframe içinden top-level window'a yönlendirme yapar.
    /// </summary>
    [HttpPost("ThreeDSCallback")]
    [AllowAnonymous]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> ThreeDSCallback()
    {
        var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:4200";

        // DEBUG: Iyzico'nun gerçekte ne gönderdiğini logla
        var formLog = new StringBuilder("Iyzico Callback Form Data:\n");
        foreach (var key in Request.Form.Keys)
        {
            formLog.AppendLine($"  {key} = {Request.Form[key]}");
        }
        _logger.LogInformation(formLog.ToString());

        // Form'dan manuel çek
        var dto = new ThreeDSCallbackDto
        {
            Status = Request.Form["status"].ToString(),
            PaymentId = Request.Form["paymentId"].ToString(),
            ConversationData = Request.Form["conversationData"].ToString(),
            ConversationId = Request.Form["conversationId"].ToString(),
            MdStatus = Request.Form["mdStatus"].ToString()
        };

        _logger.LogInformation(
            "Callback parsed: Status={Status}, PaymentId={Pid}, ConversationId={Cid}, MdStatus={Md}",
            dto.Status, dto.PaymentId, dto.ConversationId, dto.MdStatus);

        var result = await _paymentService.ProcessThreeDSCallbackAsync(dto);

        // ⭐ YENİ: Iframe'den top-level'a yönlendirme
        // window.top.location = ... ile parent window'u yönlendiriyoruz
        string redirectUrl;
        if (result.Success)
        {
            redirectUrl = $"{frontendUrl}/odeme-sonuc?status=success&rentalId={result.Data}";
        }
        else
        {
            var errorMsg = Uri.EscapeDataString(result.Message ?? "Ödeme başarısız");
            redirectUrl = $"{frontendUrl}/odeme-sonuc?status=failed&message={errorMsg}";
        }

        // HTML + JS: Iframe kısıtlamalarını aş, kullanıcıyı gerçekten yönlendir
        var html = $$"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ödeme İşleniyor...</title>
            <style>
                body {
                    font-family: 'Segoe UI', Roboto, Arial, sans-serif;
                    background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .box {
                    text-align: center;
                    padding: 40px;
                }
                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                h1 { margin: 0 0 8px; font-size: 20px; }
                p { margin: 0; opacity: 0.9; font-size: 14px; }
                a { color: white; text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="box">
                <div class="spinner"></div>
                <h1>Ödeme sonucunuz kontrol ediliyor...</h1>
                <p>Otomatik olarak yönlendiriliyorsunuz.</p>
                <p style="margin-top:20px;font-size:12px;">
                    Yönlendirilmediyseniz <a href="{{redirectUrl}}" target="_top">buraya tıklayın</a>.
                </p>
            </div>
            <script>
                // Iframe içindeysek parent'a yönlendir
                // Değilsek kendi window'unu yönlendir
                (function() {
                    var url = "{{redirectUrl}}";
                    try {
                        if (window.top && window.top !== window.self) {
                            window.top.location.href = url;
                        } else {
                            window.location.href = url;
                        }
                    } catch (e) {
                        // Cross-origin engeli varsa yine de dene
                        window.location.href = url;
                    }
                })();
            </script>
        </body>
        </html>
        """;

        return Content(html, "text/html");
    }

    /// <summary>
    /// Kullanıcı 3DS iframe'i X ile kapattığında çağrılır.
    /// </summary>
    [HttpPost("CancelPending")]
    [Authorize]
    public async Task<IActionResult> CancelPending([FromBody] CancelPaymentDto dto)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _paymentService.CancelPendingPaymentAsync(currentUserId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}