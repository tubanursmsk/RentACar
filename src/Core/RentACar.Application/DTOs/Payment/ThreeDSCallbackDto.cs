namespace RentACar.Application.DTOs.Payment;

/// <summary>
/// Iyzico'dan 3DS tamamlandığında gelen callback verileri.
/// FormBody olarak POST edilir.
/// </summary>
public class ThreeDSCallbackDto
{
    public string Status { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string ConversationData { get; set; } = string.Empty;
    public string ConversationId { get; set; } = string.Empty;
    public string MdStatus { get; set; } = string.Empty;
}
