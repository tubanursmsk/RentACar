using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Location;

public class LocationCreateDto
{
    [Required(ErrorMessage = "Şube adı zorunludur.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şehir bilgisi zorunludur.")]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Adres zorunludur.")]
    public string Address { get; set; } = string.Empty;
}
