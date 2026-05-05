using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.AdditionalService;

public class AdditionalServiceCreateDto
{
    [Required(ErrorMessage = "Hizmet adı zorunludur.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Fiyat 0'dan küçük olamaz.")]
    public decimal DailyPrice { get; set; }

    [Required(ErrorMessage = "Araç segmenti seçimi zorunludur.")]
    public string CarSegment { get; set; } = "All";
}
