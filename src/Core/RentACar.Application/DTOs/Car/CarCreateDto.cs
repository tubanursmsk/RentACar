using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Car;

public class CarCreateDto
{
    [Required]
     public int BrandId { get; set; } 
    [Required]
     public int CurrentLocationId { get; set; }
    
    [Required(ErrorMessage = "Model zorunludur.")]
    public string Model { get; set; } = string.Empty;
    
    [Range(2000, 2100, ErrorMessage = "Geçerli bir yıl giriniz.")]
    public int Year { get; set; }
    
    [Required]
    [RegularExpression(@"^(0[1-9]|[1-7][0-9]|8[0-1])\s?[A-Z]{1,3}\s?[0-9]{2,4}$", ErrorMessage = "Geçerli bir Türkiye plakası giriniz (Örn: 34 ABC 123)")]
    public string Plate { get; set; } = string.Empty;
    
    [Range(0, double.MaxValue, ErrorMessage = "Günlük fiyat 0'dan küçük olamaz.")]
    public decimal DailyPrice { get; set; }
    
    [Range(0, 1900, ErrorMessage = "Findeks puanı 0-1900 arasında olmalıdır.")]
    public int MinFindeksScore { get; set; } 
    
    public string? ImageUrl { get; set; }
}