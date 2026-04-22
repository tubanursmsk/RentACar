using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Brand;

public class BrandCreateDto
{
    [Required(ErrorMessage = "Marka adı zorunludur.")]
    [MaxLength(50, ErrorMessage = "Marka adı en fazla 50 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;
}