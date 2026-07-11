using System.Text.Json.Serialization;

namespace RentACar.Infrastructure.Services.Iyzico;

// ═══════════════════════════════════════════════════════════════════
// REQUEST MODELS
// ═══════════════════════════════════════════════════════════════════

public class ThreeDSInitRequest
{
    public string Locale { get; set; } = "tr";
    public string ConversationId { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public string PaidPrice { get; set; } = string.Empty;
    public string Currency { get; set; } = "TRY";
    public int Installment { get; set; } = 1;
    public string BasketId { get; set; } = string.Empty;
    public string PaymentChannel { get; set; } = "WEB";
    public string PaymentGroup { get; set; } = "PRODUCT";
    public string CallbackUrl { get; set; } = string.Empty;
    public IyzicoPaymentCard PaymentCard { get; set; } = new();
    public IyzicoBuyer Buyer { get; set; } = new();
    public IyzicoAddress ShippingAddress { get; set; } = new();
    public IyzicoAddress BillingAddress { get; set; } = new();
    public List<IyzicoBasketItem> BasketItems { get; set; } = new();
}

public class IyzicoPaymentCard
{
    public string CardHolderName { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public string ExpireYear { get; set; } = string.Empty;
    public string ExpireMonth { get; set; } = string.Empty;
    public string Cvc { get; set; } = string.Empty;
    public int RegisterCard { get; set; } = 0;
}

public class IyzicoBuyer
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string GsmNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string IdentityNumber { get; set; } = string.Empty;
    public string RegistrationAddress { get; set; } = string.Empty;
    public string Ip { get; set; } = "85.34.78.112";
    public string City { get; set; } = "Istanbul";
    public string Country { get; set; } = "Turkey";
    public string ZipCode { get; set; } = "34732";
}

public class IyzicoAddress
{
    public string ContactName { get; set; } = string.Empty;
    public string City { get; set; } = "Istanbul";
    public string Country { get; set; } = "Turkey";

    // ⭐ CRITICAL FIX: Iyzico REST API 'address' bekliyor, 'description' değil
    // JsonPropertyName ile serialize edilirken doğru isim gönderilir
    [JsonPropertyName("address")]
    public string Address { get; set; } = string.Empty;

    public string ZipCode { get; set; } = "34732";
}

public class IyzicoBasketItem
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category1 { get; set; } = "Car Rental";
    public string ItemType { get; set; } = "VIRTUAL";
    public string Price { get; set; } = string.Empty;
}

public class ThreeDSCompleteRequest
{
    public string Locale { get; set; } = "tr";
    public string ConversationId { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string? ConversationData { get; set; }
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE MODELS
// ═══════════════════════════════════════════════════════════════════

public class ThreeDSInitResponse
{
    public string Status { get; set; } = string.Empty;
    public string? Locale { get; set; }
    public long? SystemTime { get; set; }
    public string? ConversationId { get; set; }
    public string? PaymentId { get; set; }
    public string? ThreeDSHtmlContent { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorGroup { get; set; }
}

public class ThreeDSCompleteResponse
{
    public string Status { get; set; } = string.Empty;
    public string? Locale { get; set; }
    public long? SystemTime { get; set; }
    public string? ConversationId { get; set; }
    public string? PaymentId { get; set; }
    public decimal? Price { get; set; }
    public decimal? PaidPrice { get; set; }
    public int? Installment { get; set; }
    public string? Currency { get; set; }
    public string? BasketId { get; set; }
    public string? CardFamily { get; set; }
    public string? CardType { get; set; }
    public string? CardAssociation { get; set; }
    public string? BinNumber { get; set; }
    public string? LastFourDigits { get; set; }
    public List<IyzicoPaymentItem>? PaymentItems { get; set; }
    public string? ErrorCode { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorGroup { get; set; }
}

public class IyzicoPaymentItem
{
    public string? ItemId { get; set; }
    public decimal? Price { get; set; }
    public decimal? PaidPrice { get; set; }
    public string? PaymentTransactionId { get; set; }
}