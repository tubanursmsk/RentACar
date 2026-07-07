using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using RentACar.Domain.Entities;

namespace RentACar.AdminPanel.Models;

public class EditViewModel
{
    [Required]
    public int Id { get; set; }

    // ═══ TEMEL BİLGİLER ═══
    [Required(ErrorMessage = "Marka seçimi zorunludur.")]
    [Display(Name = "Marka")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Şube seçimi zorunludur.")]
    [Display(Name = "Şube")]
    public int CurrentLocationId { get; set; }

    [Required(ErrorMessage = "Model zorunludur.")]
    [Display(Name = "Model")]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yıl zorunludur.")]
    [Range(1990, 2100)]
    [Display(Name = "Yıl")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Plaka zorunludur.")]
    [Display(Name = "Plaka")]
    public string Plate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Günlük fiyat zorunludur.")]
    [Display(Name = "Günlük Fiyat (₺)")]
    public decimal DailyPrice { get; set; }

    // ═══ ARAÇ ÖZELLİKLERİ ═══
    [Display(Name = "Yakıt Tipi")]
    public int FuelType { get; set; }

    [Display(Name = "Vites Tipi")]
    public int TransmissionType { get; set; }

    [Range(2, 9)]
    [Display(Name = "Koltuk Sayısı")]
    public int SeatCount { get; set; } = 5;

    [Range(2, 5)]
    [Display(Name = "Kapı Sayısı")]
    public int DoorCount { get; set; } = 4;

    [Range(0, 10)]
    [Display(Name = "Büyük Bavul Sayısı")]
    public int LuggageCount { get; set; } = 2;

    [Display(Name = "Renk")]
    public string? Color { get; set; }

    [Display(Name = "Kilometre")]
    public int? Mileage { get; set; }

    [Display(Name = "Açıklama")]
    public string? Description { get; set; }

    // ═══ EK ÖZELLİKLER ═══
    [Display(Name = "Yolcu Airbag")]
    public bool HasAirbag { get; set; }

    [Display(Name = "ABS")]
    public bool HasAbs { get; set; }

    [Display(Name = "Klima")]
    public bool HasAirConditioning { get; set; }

    [Display(Name = "Bluetooth")]
    public bool HasBluetooth { get; set; }

    [Display(Name = "Navigasyon")]
    public bool HasNavigation { get; set; }

    // ═══ KİRALAMA KOŞULLARI ═══
    [Display(Name = "Minimum Findeks Skoru")]
    public int MinFindeksScore { get; set; }

    [Range(18, 75)]
    [Display(Name = "Minimum Sürücü Yaşı")]
    public int MinDriverAge { get; set; } = 21;

    [Range(0, 20)]
    [Display(Name = "Minimum Ehliyet Yaşı")]
    public int MinLicenseYears { get; set; } = 1;

    [Display(Name = "Durum")]
    public CarStatus Status { get; set; }

    public string? CurrentImageUrl { get; set; }

    [Display(Name = "Yeni Fotoğraf")]
    public IFormFile? ImageFile { get; set; }
}