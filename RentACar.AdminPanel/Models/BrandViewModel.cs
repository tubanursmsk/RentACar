using Microsoft.AspNetCore.Http;
using RentACar.Application.DTOs.Brand;
using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class BrandListViewModel
{
    public PagedResult<BrandDto> Brands { get; set; } = new();
}

public class BrandCreateViewModel
{
    [Required(ErrorMessage = "Marka adı zorunludur.")]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public IFormFile? LogoFile { get; set; }
}

public class BrandUpdateViewModel
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "Marka adı zorunludur.")]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public string? CurrentLogoUrl { get; set; }
    public IFormFile? LogoFile { get; set; }
}