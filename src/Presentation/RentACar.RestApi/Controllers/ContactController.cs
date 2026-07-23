using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(IEmailService emailService, ILogger<ContactController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Anonim kullanıcıdan iletişim formu POST'unu alır.
    /// Firmaya bildirim + Kullanıcıya auto-reply gönderir.
    /// </summary>
    [HttpPost("Send")]
    public async Task<IActionResult> Send([FromBody] ContactFormDto dto)
    {
        // ── Server-side validation ──
        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Trim().Length < 2)
            return BadRequest(ApiResponse<bool>.ErrorResult("Lütfen geçerli bir ad soyad girin."));

        if (string.IsNullOrWhiteSpace(dto.Email) || !IsValidEmail(dto.Email))
            return BadRequest(ApiResponse<bool>.ErrorResult("Lütfen geçerli bir e-posta adresi girin."));

        if (string.IsNullOrWhiteSpace(dto.Phone) || dto.Phone.Trim().Length < 10)
            return BadRequest(ApiResponse<bool>.ErrorResult("Lütfen geçerli bir telefon numarası girin."));

        if (string.IsNullOrWhiteSpace(dto.Subject) || dto.Subject.Trim().Length < 3)
            return BadRequest(ApiResponse<bool>.ErrorResult("Lütfen bir konu belirtin."));

        if (string.IsNullOrWhiteSpace(dto.Message) || dto.Message.Trim().Length < 10)
            return BadRequest(ApiResponse<bool>.ErrorResult("Mesajınız en az 10 karakter olmalı."));

        if (dto.Message.Length > 2000)
            return BadRequest(ApiResponse<bool>.ErrorResult("Mesaj en fazla 2000 karakter olabilir."));

        // ── Rate limit için basit log (ileride Redis'e taşınabilir) ──
        _logger.LogInformation(
            "Contact form: {Name} <{Email}> - {Subject}",
            dto.Name, dto.Email, dto.Subject);

        // ── Mail gönder ──
        var sent = await _emailService.SendContactFormAsync(
            dto.Name.Trim(),
            dto.Email.Trim(),
            dto.Phone.Trim(),
            dto.Subject.Trim(),
            dto.Message.Trim());

        if (!sent)
        {
            _logger.LogError("Contact form email FAILED for {Email}", dto.Email);
            return StatusCode(500, ApiResponse<bool>.ErrorResult(
                "Mesajınız iletilemedi. Lütfen daha sonra tekrar deneyin."));
        }

        return Ok(ApiResponse<bool>.SuccessResult(
            true,
            "Mesajınız başarıyla iletildi. En kısa sürede size dönüş yapacağız."));
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// DTO — Aynı dosya içinde veya DTOs klasöründe olabilir
// ═══════════════════════════════════════════════════════════════════
public class ContactFormDto
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
