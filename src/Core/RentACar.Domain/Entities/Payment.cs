

namespace RentACar.Domain.Entities;

public enum PaymentMethod
{
    OnlineCard = 1,         // Online kredi kartı (Iyzico)
    OfficePayment = 2       // Ofiste ödeme
}

public enum PaymentStatus
{
    Pending = 1,            // Bekleniyor (henüz başlatılmadı)
    Initiated = 2,          // Iyzico'ya gönderildi, 3D Secure bekleniyor
    Successful = 3,         // Tamamlandı
    Failed = 4,             // Başarısız
    Refunded = 5            // İade edildi
}

public class Payment : BaseEntity
{
    public int RentalId { get; set; }
    public Rental Rental { get; set; } = null!;

    public decimal Amount { get; set; }                       // Ödenen tutar
    public string Currency { get; set; } = "TRY";

    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }

    // Iyzico ile entegre olunca dolacak alanlar
    public string? IyzicoPaymentId { get; set; }              // Iyzico'nun ödeme ID'si
    public string? IyzicoConversationId { get; set; }         // Conversation ID
    public string? CardLastFourDigits { get; set; }           // Kart son 4 hanesi (PCI-DSS uyumu için)
    public string? CardHolderName { get; set; }
    public string? CardAssociation { get; set; }              // VISA, MASTERCARD
    public string? CardFamily { get; set; }                   // Bonus, World, Maximum
    public string? BinNumber { get; set; }                    // İlk 6 hane

    public string? FailureReason { get; set; }                // Başarısız ise nedeni
    public DateTime? PaidAt { get; set; }                     // Ödeme tamamlanma anı
    public string? ResponseJson { get; set; }                 // Tam Iyzico yanıtı (loglama için)
}
