using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace RentACar.Application.DTOs.Brand;

public class BrandCreateDto
{
    [Required(ErrorMessage = "Marka adı zorunludur.")]
    [MaxLength(50, ErrorMessage = "Marka adı en fazla 50 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;
    public IFormFile? LogoFile { get; set; }
}