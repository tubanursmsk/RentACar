using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Company;

public class CompanyCreateDto
{
    [Required(ErrorMessage = "Şirket adı zorunludur.")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vergi numarası zorunludur.")]
    [StringLength(10, MinimumLength = 10, ErrorMessage = "Vergi numarası 10 haneli olmalıdır.")]
    public string TaxNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefon numarası zorunludur.")]
    [Phone(ErrorMessage = "Geçersiz telefon formatı.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tam adres zorunludur.")]
    public string FullAddress { get; set; } = string.Empty;
}
