using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Payment;

/// <summary>
/// Frontend'den ödeme başlatma isteği. Kart bilgileri + rezervasyon ID.
/// </summary>
public class InitPaymentDto
{
    [Required]
    public int RentalId { get; set; }

    [Required]
    [StringLength(200, MinimumLength = 3, ErrorMessage = "Kart üzerindeki isim geçersiz.")]
    public string CardHolderName { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{16}$", ErrorMessage = "Kart numarası 16 haneli olmalı.")]
    public string CardNumber { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^(0[1-9]|1[0-2])$", ErrorMessage = "Ay 01-12 arası olmalı.")]
    public string ExpireMonth { get; set; } = string.Empty;

    /// <summary>4 haneli yıl (örn: 2030)</summary>
    [Required]
    [RegularExpression(@"^\d{4}$", ErrorMessage = "Yıl 4 haneli olmalı (örn: 2030).")]
    public string ExpireYear { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{3,4}$", ErrorMessage = "CVC 3 veya 4 haneli olmalı.")]
    public string Cvc { get; set; } = string.Empty;
}
