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

     private string BuildPasswordResetHtml(User user, string token)
    {
        var safeName = System.Net.WebUtility.HtmlEncode($"{user.FirstName} {user.LastName}".Trim());
 
        // ⚠️ ÖNEMLİ: Frontend URL'ini appsettings'ten okumak DAHA GÜVENLİDİR
        // Şimdilik direkt gömüyoruz - production URL'inizi kullanın!
        var frontendUrl = _settings.FrontendUrl?.TrimEnd('/') ?? "https://rentacar.tubanursimsek.com.tr";
        var resetLink = $"{frontendUrl}/sifre-sifirla?token={token}";
 
        var requestTime = DateTime.Now.ToString("dd MMMM yyyy HH:mm", TrCulture);
 
        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #f4f4f7; margin: 0; padding: 20px; color: #333; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
    .header {{ background: linear-gradient(135deg, #e2091d 0%, #b8071a 100%); color: white; padding: 40px 30px; text-align: center; }}
    .header .icon {{ font-size: 48px; margin-bottom: 12px; }}
    .header h1 {{ margin: 0; font-size: 24px; font-weight: 800; }}
    .content {{ padding: 40px 30px; line-height: 1.7; color: #444; }}
    .content p {{ margin: 0 0 16px; font-size: 15px; }}
    .cta-wrap {{ text-align: center; margin: 32px 0; }}
    .cta-btn {{ display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #e2091d 0%, #b8071a 100%); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(226, 9, 29, 0.3); }}
    .link-box {{ background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 16px; margin: 20px 0; word-break: break-all; }}
    .link-box p {{ margin: 0 0 8px; font-size: 12px; color: #999; text-transform: uppercase; font-weight: 600; }}
    .link-box a {{ color: #e2091d; text-decoration: none; font-size: 13px; word-break: break-all; }}
    .warning-box {{ background: #fef2f2; border-left: 4px solid #e2091d; border-radius: 4px; padding: 16px; margin: 24px 0; }}
    .warning-box p {{ margin: 0; font-size: 13px; color: #666; }}
    .info-row {{ padding: 10px 0; font-size: 13px; color: #666; border-top: 1px solid #f0f0f0; }}
    .info-row strong {{ color: #333; }}
    .footer {{ background: #f9f9f9; padding: 24px; text-align: center; font-size: 12px; color: #999; }}
    .footer a {{ color: #666; text-decoration: none; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='icon'>🔐</div>
      <h1>Şifre Sıfırlama Talebi</h1>
    </div>
 
    <div class='content'>
      <p>Merhaba <strong>{safeName}</strong>,</p>
      <p>RentACar hesabınız için bir şifre sıfırlama talebi aldık. Yeni bir şifre belirlemek için aşağıdaki butona tıklayın:</p>
 
      <div class='cta-wrap'>
        <a href='{resetLink}' class='cta-btn'>ŞİFREMİ SIFIRLA →</a>
      </div>
 
      <div class='link-box'>
        <p>Buton çalışmıyorsa bu bağlantıyı kopyalayıp tarayıcınıza yapıştırın:</p>
        <a href='{resetLink}'>{resetLink}</a>
      </div>
 
      <div class='warning-box'>
        <p><strong>⏱️ Bu bağlantı 1 saat geçerlidir</strong> ve sadece bir kez kullanılabilir.</p>
      </div>
 
      <div class='info-row'>
        <strong>Talep zamanı:</strong> {requestTime}
      </div>
 
      <p style='margin-top: 24px; font-size: 13px; color: #999;'>
        <strong>Bu talebi siz yapmadıysanız</strong> bu maili görmezden gelin. Şifreniz değişmeyecek ve hesabınız güvende kalacaktır.
        Şüpheli bir durum fark ederseniz lütfen bizimle iletişime geçin.
      </p>
    </div>
 
    <div class='footer'>
      <p>Bu otomatik bir maildir, lütfen bu adrese yanıt vermeyin.</p>
      <p>© {DateTime.Now.Year} RentACar. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>";
    }

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

     public async Task<bool> SendPasswordResetEmailAsync(User user, string token)
    {
        var toName = $"{user.FirstName} {user.LastName}".Trim();
        var subject = "Şifre Sıfırlama Talebi — RentACar";
        var htmlBody = BuildPasswordResetHtml(user, token);
 
        return await SendEmailAsync(user.Email, toName, subject, htmlBody);
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
    // İLETİŞİM FORMU MAİLİ (Müşteri → Firma)
    // ═══════════════════════════════════════════════════════════════════
    public async Task<bool> SendContactFormAsync(
        string senderName,
        string senderEmail,
        string senderPhone,
        string subject,
        string message)
    {
        // Firmanın kendi mail adresi — appsettings'ten okunur
        var adminEmail = _settings.AdminEmail;
        if (string.IsNullOrWhiteSpace(adminEmail))
        {
            _logger.LogWarning("AdminEmail not configured. Contact form email skipped.");
            return false;
        }

        var mailSubject = $"📧 Yeni İletişim Talebi: {subject}";
        var htmlBody = BuildContactFormHtml(senderName, senderEmail, senderPhone, subject, message);

        // 1) Firmaya (admin) bildirim gönder
        var adminResult = await SendEmailAsync(adminEmail, _settings.FromName, mailSubject, htmlBody);

        // 2) Müşteriye otomatik yanıt gönder (auto-reply)
        if (!string.IsNullOrWhiteSpace(senderEmail))
        {
            var autoReplyHtml = BuildContactAutoReplyHtml(senderName);
            // Fire-and-forget — auto-reply başarısız olursa admin mail yine gitti
            _ = SendEmailAsync(senderEmail, senderName, "Talebiniz alındı — RentACar", autoReplyHtml);
        }

        return adminResult;
    }

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: REZERVASYON BİLDİRİMİ (Firmaya)
    // ═══════════════════════════════════════════════════════════════════
    public async Task<bool> SendReservationNotificationToAdminAsync(Rental rental)
    {
        var adminEmail = _settings.AdminEmail;
        if (string.IsNullOrWhiteSpace(adminEmail))
        {
            _logger.LogWarning("AdminEmail not configured. Admin notification skipped.");
            return false;
        }

        var code = rental.ReservationCode ?? $"RNT-{rental.Id}";
        var subject = $"🎫 Yeni Rezervasyon: {code}";
        var htmlBody = BuildReservationAdminNotificationHtml(rental);

        return await SendEmailAsync(adminEmail, _settings.FromName, subject, htmlBody);
    }

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: HTML BUILDER — İletişim Formu (Firmaya)
    // ═══════════════════════════════════════════════════════════════════
    private string BuildContactFormHtml(
        string senderName,
        string senderEmail,
        string senderPhone,
        string subject,
        string message)
    {
        // XSS koruması — kullanıcı girdisini HTML-escape ediyoruz
        var safeName = System.Net.WebUtility.HtmlEncode(senderName);
        var safeEmail = System.Net.WebUtility.HtmlEncode(senderEmail);
        var safePhone = System.Net.WebUtility.HtmlEncode(senderPhone);
        var safeSubject = System.Net.WebUtility.HtmlEncode(subject);
        var safeMessage = System.Net.WebUtility.HtmlEncode(message).Replace("\n", "<br>");

        var receivedAt = DateTime.Now.ToString("dd MMMM yyyy HH:mm", TrCulture);

        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #f4f4f7; margin: 0; padding: 20px; color: #333; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
    .header {{ background: linear-gradient(135deg, #e2091d 0%, #b8071a 100%); color: white; padding: 30px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 22px; }}
    .header p {{ margin: 8px 0 0; opacity: 0.9; font-size: 14px; }}
    .content {{ padding: 30px; }}
    .info-row {{ display: table; width: 100%; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }}
    .info-label {{ display: table-cell; width: 100px; font-weight: 600; color: #666; font-size: 13px; }}
    .info-value {{ display: table-cell; color: #333; font-size: 14px; }}
    .message-box {{ background: #f9f9f9; border-left: 4px solid #e2091d; padding: 16px; margin-top: 20px; border-radius: 4px; }}
    .message-box p {{ margin: 0; color: #444; line-height: 1.6; }}
    .footer {{ background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }}
    .btn {{ display: inline-block; padding: 12px 24px; background: #e2091d; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>📧 Yeni İletişim Talebi</h1>
      <p>Web sitesi iletişim formundan yeni bir mesaj alındı</p>
    </div>
 
    <div class='content'>
      <div class='info-row'>
        <div class='info-label'>👤 Ad Soyad</div>
        <div class='info-value'>{safeName}</div>
      </div>
      <div class='info-row'>
        <div class='info-label'>✉️ E-posta</div>
        <div class='info-value'><a href='mailto:{safeEmail}' style='color: #e2091d;'>{safeEmail}</a></div>
      </div>
      <div class='info-row'>
        <div class='info-label'>📱 Telefon</div>
        <div class='info-value'><a href='tel:{safePhone}' style='color: #e2091d;'>{safePhone}</a></div>
      </div>
      <div class='info-row'>
        <div class='info-label'>📌 Konu</div>
        <div class='info-value'><strong>{safeSubject}</strong></div>
      </div>
      <div class='info-row'>
        <div class='info-label'>🕐 Zaman</div>
        <div class='info-value'>{receivedAt}</div>
      </div>
 
      <div class='message-box'>
        <p><strong>Mesaj:</strong></p>
        <p>{safeMessage}</p>
      </div>
 
      <div style='text-align: center;'>
        <a href='mailto:{safeEmail}?subject=RE: {safeSubject}' class='btn'>Yanıtla</a>
      </div>
    </div>
 
    <div class='footer'>
      <p>Bu mail RentACar iletişim formundan otomatik olarak oluşturulmuştur.</p>
      <p>© {DateTime.Now.Year} RentACar. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>";
    }

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: HTML BUILDER — Otomatik Yanıt (Müşteriye)
    // ═══════════════════════════════════════════════════════════════════
    private string BuildContactAutoReplyHtml(string senderName)
    {
        var safeName = System.Net.WebUtility.HtmlEncode(senderName);

        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #f4f4f7; margin: 0; padding: 20px; color: #333; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
    .header {{ background: linear-gradient(135deg, #e2091d 0%, #b8071a 100%); color: white; padding: 40px 30px; text-align: center; }}
    .header .icon {{ font-size: 48px; margin-bottom: 12px; }}
    .header h1 {{ margin: 0; font-size: 24px; }}
    .content {{ padding: 30px; line-height: 1.7; color: #444; }}
    .content p {{ margin: 0 0 16px; }}
    .info-box {{ background: #fef5f6; border: 1px solid #f7c5cb; border-radius: 8px; padding: 16px; margin: 20px 0; }}
    .info-box p {{ margin: 0; font-size: 14px; color: #666; }}
    .footer {{ background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <div class='icon'>✓</div>
      <h1>Mesajınız alındı!</h1>
    </div>
 
    <div class='content'>
      <p>Merhaba <strong>{safeName}</strong>,</p>
      <p>RentACar ile iletişime geçtiğiniz için teşekkür ederiz. Mesajınız ekibimize başarıyla iletilmiştir.</p>
      <p>En kısa sürede size dönüş yapacağız — genellikle <strong>iş günlerinde 4 saat içinde</strong> yanıtlıyoruz.</p>
 
      <div class='info-box'>
        <p><strong>💡 Acil bir durumsa:</strong></p>
        <p>7/24 çağrı merkezimizi arayabilirsiniz: <strong>0850 XXX XX XX</strong></p>
      </div>
 
      <p>Rezervasyonlarınızı incelemek veya yeni bir araç kiralamak için sitemizi ziyaret edebilirsiniz.</p>
      <p>Saygılarımızla,<br><strong>RentACar Ekibi</strong></p>
    </div>
 
    <div class='footer'>
      <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu adrese yanıt vermeyin.</p>
      <p>© {DateTime.Now.Year} RentACar. Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>";
    }

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: HTML BUILDER — Firmaya Rezervasyon Bildirimi
    // ═══════════════════════════════════════════════════════════════════
    private string BuildReservationAdminNotificationHtml(Rental rental)
    {
        var code = rental.ReservationCode ?? $"RNT-{rental.Id}";
        var carName = rental.Car != null
            ? $"{rental.Car.Brand?.Name} {rental.Car.Model}"
            : "-";
        var carPlate = rental.Car?.Plate ?? "-";
        var pickupLocation = rental.PickUpLocation?.Name ?? "-";
        var dropoffLocation = rental.DropOffLocation?.Name ?? "-";
        var pickupDate = rental.RentStartDate.ToString("dd MMMM yyyy HH:mm", TrCulture);
        var returnDate = rental.RentEndDate.ToString("dd MMMM yyyy HH:mm", TrCulture);
        var totalDays = Math.Max(1, (int)Math.Ceiling((rental.RentEndDate - rental.RentStartDate).TotalDays));
        var totalAmount = rental.TotalAmount.ToString("N2", TrCulture);
        var paymentStatus = rental.IsPaid ? "✅ Online Ödenmiş" : "⏳ Ofiste Ödenecek";
        var driverName = $"{rental.DriverFirstName} {rental.DriverLastName}".Trim();

        return $@"
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <style>
    body {{ font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; background: #f4f4f7; margin: 0; padding: 20px; color: #333; }}
    .container {{ max-width: 620px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
    .header {{ background: linear-gradient(135deg, #e2091d 0%, #b8071a 100%); color: white; padding: 30px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 22px; }}
    .header .code {{ display: inline-block; background: rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 20px; margin-top: 10px; font-family: monospace; letter-spacing: 1px; }}
    .content {{ padding: 30px; }}
    .section {{ margin-bottom: 24px; }}
    .section h3 {{ font-size: 14px; text-transform: uppercase; color: #999; margin: 0 0 12px; letter-spacing: 1px; }}
    .info-grid {{ background: #f9f9f9; border-radius: 8px; padding: 16px; }}
    .info-row {{ display: table; width: 100%; padding: 8px 0; }}
    .info-label {{ display: table-cell; width: 130px; font-weight: 600; color: #666; font-size: 13px; }}
    .info-value {{ display: table-cell; color: #333; font-size: 14px; }}
    .payment-badge {{ display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }}
    .payment-paid {{ background: #d1fae5; color: #065f46; }}
    .payment-pending {{ background: #fef3c7; color: #92400e; }}
    .amount-box {{ background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #e2091d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
    .amount-box .label {{ font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 1px; }}
    .amount-box .value {{ font-size: 28px; font-weight: 900; color: #e2091d; margin-top: 4px; }}
    .footer {{ background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }}
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>🎫 Yeni Rezervasyon Alındı</h1>
      <div class='code'>{code}</div>
    </div>
 
    <div class='content'>
      <div class='section'>
        <h3>👤 Sürücü Bilgileri</h3>
        <div class='info-grid'>
          <div class='info-row'>
            <div class='info-label'>Ad Soyad</div>
            <div class='info-value'><strong>{driverName}</strong></div>
          </div>
          <div class='info-row'>
            <div class='info-label'>E-posta</div>
            <div class='info-value'><a href='mailto:{rental.DriverEmail}' style='color: #e2091d;'>{rental.DriverEmail}</a></div>
          </div>
          <div class='info-row'>
            <div class='info-label'>Telefon</div>
            <div class='info-value'><a href='tel:{rental.DriverPhone}' style='color: #e2091d;'>{rental.DriverPhone}</a></div>
          </div>
          <div class='info-row'>
            <div class='info-label'>T.C. No</div>
            <div class='info-value'>{rental.DriverIdentityNumber}</div>
          </div>
        </div>
      </div>
 
      <div class='section'>
        <h3>🚗 Araç</h3>
        <div class='info-grid'>
          <div class='info-row'>
            <div class='info-label'>Model</div>
            <div class='info-value'><strong>{carName}</strong></div>
          </div>
          <div class='info-row'>
            <div class='info-label'>Plaka</div>
            <div class='info-value' style='font-family: monospace; font-weight: 700;'>{carPlate}</div>
          </div>
        </div>
      </div>
 
      <div class='section'>
        <h3>📅 Rezervasyon Detayı</h3>
        <div class='info-grid'>
          <div class='info-row'>
            <div class='info-label'>Alış</div>
            <div class='info-value'>{pickupDate}<br><span style='color: #999; font-size: 12px;'>📍 {pickupLocation}</span></div>
          </div>
          <div class='info-row'>
            <div class='info-label'>İade</div>
            <div class='info-value'>{returnDate}<br><span style='color: #999; font-size: 12px;'>📍 {dropoffLocation}</span></div>
          </div>
          <div class='info-row'>
            <div class='info-label'>Toplam Gün</div>
            <div class='info-value'>{totalDays} gün</div>
          </div>
          <div class='info-row'>
            <div class='info-label'>Ödeme Durumu</div>
            <div class='info-value'>
              <span class='payment-badge {(rental.IsPaid ? "payment-paid" : "payment-pending")}'>{paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>
 
      <div class='amount-box'>
        <div class='label'>Toplam Tutar</div>
        <div class='value'>₺{totalAmount}</div>
      </div>
    </div>
 
    <div class='footer'>
      <p>Bu bildirim yeni bir rezervasyon oluştuğunda otomatik olarak gönderilir.</p>
      <p>© {DateTime.Now.Year} RentACar Admin Notification System</p>
    </div>
  </div>
</body>
</html>";
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
