
using System.ComponentModel.DataAnnotations;
using RentACar.Domain.Entities;

public class CreateViewModel
{
    [Required(ErrorMessage = "Marka seçimi zorunludur.")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Şube seçimi zorunludur.")]
    public int CurrentLocationId { get; set; }

    [Required(ErrorMessage = "Model zorunludur.")]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yıl zorunludur.")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Plaka zorunludur.")]
    public string Plate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Günlük fiyat zorunludur.")]
    public decimal DailyPrice { get; set; }

    public int MinFindeksScore { get; set; }

    public CarStatus Status { get; set; } = CarStatus.Available;

    public IFormFile? ImageFile { get; set; }
}
