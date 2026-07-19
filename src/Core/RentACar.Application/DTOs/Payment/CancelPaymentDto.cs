namespace RentACar.Application.DTOs.Payment;

public class CancelPaymentDto
{
    /// <summary>
    /// Iyzico'ya init sırasında verdiğimiz conversationId.
    /// Bu ID ile pending Payment kaydını buluyoruz.
    /// </summary>
    public string ConversationId { get; set; } = string.Empty;
}
