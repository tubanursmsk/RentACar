using RentACar.Application.DTOs.Location;
using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class LocationListViewModel
{
    public PagedResult<LocationDto> Locations { get; set; } = new();
}

public class LocationCreateViewModel
{
    [Required(ErrorMessage = "Şube adı zorunludur.")]
    [MaxLength(100, ErrorMessage = "Şube adı en fazla 100 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şehir bilgisi zorunludur.")]
    [MaxLength(50)]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Adres zorunludur.")]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
}

public class LocationUpdateViewModel
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "Şube adı zorunludur.")]
    [MaxLength(100, ErrorMessage = "Şube adı en fazla 100 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şehir bilgisi zorunludur.")]
    [MaxLength(50)]
    public string City { get; set; } = string.Empty;

    [Required(ErrorMessage = "Adres zorunludur.")]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
}