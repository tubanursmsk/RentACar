namespace RentACar.Domain.Entities;

public enum PaymentMethod
{
    OnlineCard = 1,         // Online kredi kartı (Iyzico)
    OfficePayment = 2       // Ofiste ödeme
}

public enum PaymentStatus
{
    Pending = 1,      // Başlatıldı, henüz sonuç yok
    Success = 2,      // Başarılı
    Failed = 3,       // Başarısız
    Refunded = 4,     // İade edildi
    Cancelled = 5     // İptal edildi
}

/// <summary>
/// Ödeme kaydı — Iyzico entegrasyonu için gereken tüm alanlarla.
/// Bir Rental'ın 1 veya daha fazla Payment'ı olabilir (iade durumunda).
/// </summary>
public class Payment : BaseEntity
{
    // ═══ İlişki ═══
    public int RentalId { get; set; }
    public Rental Rental { get; set; } = null!;
 
    // ═══ Ödeme Bilgileri ═══
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "TRY";
    public PaymentMethod Method { get; set; } = PaymentMethod.OnlineCard;
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
 
    // ═══ Iyzico'ya özel alanlar ═══
    public string? ConversationId { get; set; }       // Bizim ürettiğimiz unique id
    public string? IyzicoPaymentId { get; set; }      // Iyzico'nun döndüğü paymentId
    public string? IyzicoConversationId { get; set; } // Iyzico'nun döndüğü conversationId (bizimkiyle aynı)
    public string? PaymentTransactionId { get; set; } // Iyzico'nun paymentTransactionId
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
 
    // ═══ Kart bilgileri (KVKK — sadece maskeli tutulur) ═══
    public string? CardHolderName { get; set; }
    public string? MaskedCardNumber { get; set; }     // "5528 79** **** 0008" gibi
    public string? CardFamily { get; set; }            // "Bonus", "Axess" vb.
    public string? CardType { get; set; }              // "CREDIT_CARD" vb.
    public string? CardAssociation { get; set; }       // "MASTER_CARD", "VISA" vb.
 
    // ═══ Zaman damgaları ═══
    public DateTime? CompletedDate { get; set; }
    public DateTime? RefundedDate { get; set; }
}
 