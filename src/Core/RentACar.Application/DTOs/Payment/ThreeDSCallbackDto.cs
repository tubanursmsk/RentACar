namespace RentACar.Application.DTOs.Payment;

/// Iyzico'dan 3DS tamamlandığında gelen callback verileri.
/// PaymentController'da Request.Form'dan manuel doldurulur.
/// Application katmanı framework-agnostic kalması için attribute yok.
public class ThreeDSCallbackDto
{
    public string Status { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string ConversationData { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
    public string MdStatus { get; set; } = string.Empty;
}
