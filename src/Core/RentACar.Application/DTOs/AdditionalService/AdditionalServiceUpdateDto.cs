using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.AdditionalService;
public class AdditionalServiceUpdateDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Hizmet adı zorunludur.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Fiyat 0'dan küçük olamaz.")]
    public decimal DailyPrice { get; set; }
}