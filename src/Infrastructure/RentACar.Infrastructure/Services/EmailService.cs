using System.Globalization;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;
using RentACar.Infrastructure.Configurations;

namespace RentACar.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;
    private static readonly CultureInfo TrCulture = new("tr-TR");

    public EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    // ═══════════════════════════════════════════════════════════════════
    // GENERIC EMAIL GÖNDERME
    // ═══════════════════════════════════════════════════════════════════
    public async Task<bool> SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(_settings.SmtpHost) || string.IsNullOrWhiteSpace(_settings.SmtpUsername))
        {
            _logger.LogWarning("Email settings not configured. Skipping email to {Email}", toEmail);
            return false;
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
            email.To.Add(new MailboxAddress(toName, toEmail));
            email.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            var secureOption = _settings.UseStartTls
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.SslOnConnect;

            await smtp.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, secureOption);
            await smtp.AuthenticateAsync(_settings.SmtpUsername, _settings.SmtpPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("✓ Email sent to {Email}: {Subject}", toEmail, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "✗ Email failed to {Email}: {Subject}", toEmail, subject);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // REZERVASYON ONAY MAİLİ
    // ═══════════════════════════════════════════════════════════════════
    public async Task<bool> SendReservationConfirmationAsync(Rental rental)
    {
        var toEmail = rental.DriverEmail;
        if (string.IsNullOrEmpty(toEmail))
        {
            _logger.LogWarning("Reservation {Id} has no driver email", rental.Id);
            return false;
        }

        var toName = $"{rental.DriverFirstName} {rental.DriverLastName}".Trim();
        var code = rental.ReservationCode ?? $"RNT-{rental.Id}";
        var subject = $"Rezervasyonunuz alındı - {code}";
        var html = BuildReservationConfirmationHtml(rental);

        return await SendEmailAsync(toEmail, toName, subject, html);
    }

    // ═══════════════════════════════════════════════════════════════════
    // HOŞ GELDİN MAİLİ
    // ═══════════════════════════════════════════════════════════════════
    public async Task<bool> SendWelcomeEmailAsync(User user)
    {
        if (string.IsNullOrEmpty(user.Email)) return false;
        var toName = $"{user.FirstName} {user.LastName}".Trim();
        const string subject = "RentACar'a hoş geldiniz! 🎉";
        var html = BuildWelcomeHtml(user);

        return await SendEmailAsync(user.Email, toName, subject, html);
    }

    // ═══════════════════════════════════════════════════════════════════
    // HTML TEMPLATE — REZERVASYON ONAY
    // ═══════════════════════════════════════════════════════════════════
    private static string BuildReservationConfirmationHtml(Rental rental)
    {
        var carInfo = $"{rental.Car?.Brand?.Name} {rental.Car?.Model}".Trim();
        if (string.IsNullOrWhiteSpace(carInfo)) carInfo = "Aracınız";

        var startDate = rental.RentStartDate.ToString("dd MMMM yyyy - HH:mm", TrCulture);
        var endDate = rental.RentEndDate.ToString("dd MMMM yyyy - HH:mm", TrCulture);
        var amount = rental.TotalAmount.ToString("N2", TrCulture);
        var code = rental.ReservationCode ?? $"RNT-{rental.Id}";
        var pickupLoc = rental.PickUpLocation?.Name ?? "Belirtilmedi";
        var dropoffLoc = rental.DropOffLocation?.Name ?? "Belirtilmedi";

        var statusBadge = rental.Status switch
        {
            ReservationStatus.Approved => "<span style='background:#22c55e;color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;'>✓ Onaylandı</span>",
            ReservationStatus.Pending => "<span style='background:#f59e0b;color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;'>⏳ Beklemede</span>",
            _ => "<span style='background:#6b7280;color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;'>Durum güncelleniyor</span>"
        };

        var paymentInfo = rental.IsPaid
            ? "<div style='background:#dcfce7;color:#166534;padding:12px 16px;border-radius:8px;font-size:14px;margin-top:16px;'>✓ <strong>Online Ödeme yapıldı</strong> — Aracınız için ek ödeme yapmanız gerekmez.</div>"
            : "<div style='background:#fef3c7;color:#92400e;padding:12px 16px;border-radius:8px;font-size:14px;margin-top:16px;'>⏳ <strong>Ofiste Ödeme</strong> — Aracınızı teslim aldığınız ofiste ödeme yapabilirsiniz.</div>";

        return $$$"""
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Rezervasyon Onayı</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background-color:#f5f5f7;color:#1f2937;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

                            <!-- Header -->
                            <tr>
                                <td style="background:linear-gradient(135deg,#1976D2 0%,#1565C0 100%);padding:32px 24px;text-align:center;">
                                    <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-block;line-height:64px;font-size:32px;margin-bottom:12px;">🎉</div>
                                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">Rezervasyonunuz Alındı!</h1>
                                    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Detaylar aşağıda</p>
                                </td>
                            </tr>

                            <!-- Rezervasyon Kodu -->
                            <tr>
                                <td style="padding:32px 24px 16px;text-align:center;">
                                    <p style="color:#6b7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Rezervasyon Kodunuz</p>
                                    <div style="background:#eff6ff;border:2px solid #dbeafe;color:#1976D2;padding:12px 24px;border-radius:12px;display:inline-block;font-size:22px;font-weight:800;letter-spacing:2px;">{{{code}}}</div>
                                    <div style="margin-top:12px;">{{{statusBadge}}}</div>
                                </td>
                            </tr>

                            <!-- Merhaba -->
                            <tr>
                                <td style="padding:16px 32px;">
                                    <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
                                        Merhaba <strong>{{{rental.DriverFirstName}}} {{{rental.DriverLastName}}}</strong>,<br><br>
                                        Rezervasyonunuz başarıyla oluşturuldu. Aşağıdaki detayları kontrol etmenizi öneririz.
                                    </p>
                                </td>
                            </tr>

                            <!-- Detaylar Kutu -->
                            <tr>
                                <td style="padding:8px 32px 24px;">
                                    <table cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #e5e7eb;">
                                        <tr>
                                            <td style="padding:8px 0;font-size:14px;color:#6b7280;">🚗 Araç</td>
                                            <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">{{{carInfo}}}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="height:1px;background:#e5e7eb;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding:8px 0;font-size:14px;color:#6b7280;">📅 Alış</td>
                                            <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">{{{startDate}}}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:8px 0;font-size:14px;color:#6b7280;padding-left:16px;">📍 Ofis</td>
                                            <td style="padding:8px 0;font-size:13px;color:#374151;text-align:right;">{{{pickupLoc}}}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="height:1px;background:#e5e7eb;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding:8px 0;font-size:14px;color:#6b7280;">📅 İade</td>
                                            <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">{{{endDate}}}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding:8px 0;font-size:14px;color:#6b7280;padding-left:16px;">📍 Ofis</td>
                                            <td style="padding:8px 0;font-size:13px;color:#374151;text-align:right;">{{{dropoffLoc}}}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="2" style="height:1px;background:#e5e7eb;"></td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0 4px;font-size:14px;color:#6b7280;">Toplam</td>
                                            <td style="padding:12px 0 4px;font-size:22px;color:#1976D2;font-weight:800;text-align:right;">₺{{{amount}}}</td>
                                        </tr>
                                    </table>

                                    {{{paymentInfo}}}
                                </td>
                            </tr>

                            <!-- CTA -->
                            <tr>
                                <td style="padding:0 32px 32px;text-align:center;">
                                    <a href="http://localhost:4200/rezervasyonlarim" style="background:#1976D2;color:#ffffff;padding:14px 32px;border-radius:24px;text-decoration:none;font-size:14px;font-weight:700;display:inline-block;">
                                        Rezervasyonlarımı Görüntüle →
                                    </a>
                                </td>
                            </tr>

                            <!-- Notlar -->
                            <tr>
                                <td style="padding:0 32px 24px;">
                                    <div style="background:#f0f9ff;border-left:4px solid #1976D2;padding:16px;border-radius:6px;">
                                        <p style="margin:0;font-size:13px;color:#0c4a6e;line-height:1.6;">
                                            <strong>💡 Önemli Bilgiler:</strong><br>
                                            • Aracı teslim alırken kimlik, ehliyet ve kredi kartı yanınızda olmalı<br>
                                            • Ehliyet en az 1 yaşında olmalı<br>
                                            • Depozito kredi kartınızdan bloke edilecek<br>
                                            • İptal için alışa 24 saatten fazla kalmalı
                                        </p>
                                    </div>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                                        Sorularınız için: <a href="mailto:destek@rentacar.com" style="color:#1976D2;text-decoration:none;">destek@rentacar.com</a><br>
                                        7/24 Çağrı Merkezi: <strong>444 4 999</strong>
                                    </p>
                                    <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;">
                                        © 2026 RentACar. Tüm hakları saklıdır.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;
    }

    // ═══════════════════════════════════════════════════════════════════
    // HTML TEMPLATE — HOŞ GELDİN
    // ═══════════════════════════════════════════════════════════════════
    private static string BuildWelcomeHtml(User user)
    {
        return $$$"""
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Hoş Geldiniz</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background-color:#f5f5f7;color:#1f2937;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">

                            <!-- Header -->
                            <tr>
                                <td style="background:linear-gradient(135deg,#1976D2 0%,#1565C0 100%);padding:40px 24px;text-align:center;">
                                    <div style="font-size:56px;margin-bottom:8px;">🎉</div>
                                    <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;">Hoş Geldiniz!</h1>
                                    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">RentACar ailesine katıldınız</p>
                                </td>
                            </tr>

                            <!-- İçerik -->
                            <tr>
                                <td style="padding:32px 32px 16px;">
                                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#374151;">
                                        Merhaba <strong>{{{user.FirstName}}}</strong>,
                                    </p>
                                    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">
                                        RentACar'ı tercih ettiğiniz için teşekkür ederiz! Artık geniş araç filomuza,
                                        özel kampanyalarımıza ve hızlı rezervasyon sistemimize erişiminiz var.
                                    </p>
                                </td>
                            </tr>

                            <!-- Avantajlar -->
                            <tr>
                                <td style="padding:0 32px 24px;">
                                    <h2 style="color:#111827;font-size:18px;font-weight:700;margin:0 0 16px;">Size Sunduklarımız</h2>
                                    <table cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td style="padding:12px 0;vertical-align:top;">
                                                <table>
                                                    <tr>
                                                        <td style="width:44px;vertical-align:top;">
                                                            <div style="width:36px;height:36px;background:#eff6ff;border-radius:10px;text-align:center;line-height:36px;font-size:20px;">🚗</div>
                                                        </td>
                                                        <td style="padding-left:12px;">
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">Geniş Araç Filosu</p>
                                                            <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Ekonomikten lüks segmente 100+ araç seçeneği</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0;vertical-align:top;">
                                                <table>
                                                    <tr>
                                                        <td style="width:44px;vertical-align:top;">
                                                            <div style="width:36px;height:36px;background:#eff6ff;border-radius:10px;text-align:center;line-height:36px;font-size:20px;">🎁</div>
                                                        </td>
                                                        <td style="padding-left:12px;">
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">İlk Kiralamaya Özel %20 İndirim</p>
                                                            <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Kod: <strong style="color:#1976D2;">HOSGELDIN</strong> (30 gün geçerli)</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0;vertical-align:top;">
                                                <table>
                                                    <tr>
                                                        <td style="width:44px;vertical-align:top;">
                                                            <div style="width:36px;height:36px;background:#eff6ff;border-radius:10px;text-align:center;line-height:36px;font-size:20px;">🔒</div>
                                                        </td>
                                                        <td style="padding-left:12px;">
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">Güvenli Ödeme</p>
                                                            <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">256-bit SSL şifreleme, 3D Secure destekli</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding:12px 0;vertical-align:top;">
                                                <table>
                                                    <tr>
                                                        <td style="width:44px;vertical-align:top;">
                                                            <div style="width:36px;height:36px;background:#eff6ff;border-radius:10px;text-align:center;line-height:36px;font-size:20px;">📞</div>
                                                        </td>
                                                        <td style="padding-left:12px;">
                                                            <p style="margin:0;font-size:14px;font-weight:700;color:#111827;">7/24 Destek</p>
                                                            <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">Kesintisiz çağrı merkezi ve WhatsApp desteği</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- CTA -->
                            <tr>
                                <td style="padding:8px 32px 32px;text-align:center;">
                                    <a href="http://localhost:4200/araclar" style="background:#1976D2;color:#ffffff;padding:14px 40px;border-radius:24px;text-decoration:none;font-size:15px;font-weight:700;display:inline-block;">
                                        İlk Aracını Kirala →
                                    </a>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
                                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
                                        Sorularınız için: <a href="mailto:destek@rentacar.com" style="color:#1976D2;text-decoration:none;">destek@rentacar.com</a><br>
                                        7/24 Çağrı Merkezi: <strong>444 4 999</strong>
                                    </p>
                                    <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;">
                                        Bu e-postayı RentACar'a kayıt olduğunuz için aldınız.<br>
                                        © 2026 RentACar. Tüm hakları saklıdır.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """;
    }
}
