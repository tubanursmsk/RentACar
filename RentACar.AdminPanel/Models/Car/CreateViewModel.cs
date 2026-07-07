using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using RentACar.Domain.Entities;

namespace RentACar.AdminPanel.Models;

public class CreateViewModel
{
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
    [Range(1990, 2100, ErrorMessage = "Yıl geçerli aralıkta olmalı.")]
    [Display(Name = "Yıl")]
    public int Year { get; set; } = DateTime.Now.Year;

    [Required(ErrorMessage = "Plaka zorunludur.")]
    [Display(Name = "Plaka")]
    public string Plate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Günlük fiyat zorunludur.")]
    [Range(0.01, 999999, ErrorMessage = "Günlük fiyat 0'dan büyük olmalı.")]
    [Display(Name = "Günlük Fiyat (₺)")]
    public decimal DailyPrice { get; set; }

    // ═══ ARAÇ ÖZELLİKLERİ ═══
    [Required(ErrorMessage = "Yakıt tipi zorunludur.")]
    [Display(Name = "Yakıt Tipi")]
    public int FuelType { get; set; } = 1;

    [Required(ErrorMessage = "Vites tipi zorunludur.")]
    [Display(Name = "Vites Tipi")]
    public int TransmissionType { get; set; } = 2;

    [Range(2, 9, ErrorMessage = "Koltuk sayısı 2-9 arasında olmalı.")]
    [Display(Name = "Koltuk Sayısı")]
    public int SeatCount { get; set; } = 5;

    [Range(2, 5, ErrorMessage = "Kapı sayısı 2-5 arasında olmalı.")]
    [Display(Name = "Kapı Sayısı")]
    public int DoorCount { get; set; } = 4;

    [Range(0, 10, ErrorMessage = "Bavul sayısı 0-10 arasında olmalı.")]
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
    public bool HasAirbag { get; set; } = true;

    [Display(Name = "ABS")]
    public bool HasAbs { get; set; } = true;

    [Display(Name = "Klima")]
    public bool HasAirConditioning { get; set; } = true;

    [Display(Name = "Bluetooth")]
    public bool HasBluetooth { get; set; }

    [Display(Name = "Navigasyon")]
    public bool HasNavigation { get; set; }

    // ═══ KİRALAMA KOŞULLARI ═══
    [Range(0, 2000, ErrorMessage = "Findeks skoru 0-2000 arasında olmalı.")]
    [Display(Name = "Minimum Findeks Skoru")]
    public int MinFindeksScore { get; set; } = 0;

    [Range(18, 75, ErrorMessage = "Minimum yaş 18-75 arasında olmalı.")]
    [Display(Name = "Minimum Sürücü Yaşı")]
    public int MinDriverAge { get; set; } = 21;

    [Range(0, 20, ErrorMessage = "Ehliyet yaşı 0-20 arasında olmalı.")]
    [Display(Name = "Minimum Ehliyet Yaşı")]
    public int MinLicenseYears { get; set; } = 1;

    // ═══ DURUM & MEDYA ═══
    [Display(Name = "Durum")]
    public CarStatus Status { get; set; } = CarStatus.Available;

    [Display(Name = "Araç Fotoğrafı")]
    public IFormFile? ImageFile { get; set; }
}