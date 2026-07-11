namespace RentACar.Application.DTOs.Payment;

/// <summary>
/// 3DS init sonrası frontend'e gönderilen yanıt.
/// ThreeDSHtmlContent, iframe içinde render edilecek base64'ten decode edilmiş HTML.
/// </summary>
public class PaymentInitResponseDto
{
    /// <summary>3DS için Iyzico'nun döndürdüğü decoded HTML içeriği.</summary>
    public string ThreeDSHtmlContent { get; set; } = string.Empty;

    /// <summary>Bizim ürettiğimiz conversation ID — callback'te eşleştirmek için.</summary>
    public string ConversationId { get; set; } = string.Empty;

    /// <summary>Iyzico'nun yanıtındaki paymentId (opsiyonel, bazı akışlarda gelir).</summary>
    public string? PaymentId { get; set; }
}
