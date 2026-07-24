using RentACar.Domain.Entities;

namespace RentACar.Application.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Generic email gönderme metodu.
    /// </summary>
    Task<bool> SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);

    /// <summary>
    /// Rezervasyon onay maili gönderir.
    /// </summary>
    Task<bool> SendReservationConfirmationAsync(Rental rental);

    /// <summary>
    /// Yeni kayıt olan kullanıcıya hoş geldin maili gönderir.
    /// </summary>
    Task<bool> SendWelcomeEmailAsync(User user);


    // ⭐ YENİ: İletişim formundan gelen mesajı firmaya iletir
    Task<bool> SendContactFormAsync(
        string senderName,
        string senderEmail,
        string senderPhone,
        string subject,
        string message);

    //Yeni rezervasyon oluştuğunda firmaya bildirim
    Task<bool> SendReservationNotificationToAdminAsync(Rental rental);

     Task<bool> SendPasswordResetEmailAsync(User user, string token);
 
}
