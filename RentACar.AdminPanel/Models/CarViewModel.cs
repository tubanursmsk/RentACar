using System.ComponentModel.DataAnnotations;
using RentACar.Application.DTOs.Car;
using RentACar.Domain.Entities;

namespace RentACar.AdminPanel.Models;

/// <summary>
/// Araç listesi view'ında kullanılacak
/// </summary>
public class CarListViewModel
{
    public int Id { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Plate { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public string CurrentLocationName { get; set; } = string.Empty;
    public CarStatus Status { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedDate { get; set; }
}

/// <summary>
/// Araç ekleme formunda kullanılacak
/// </summary>
public class CarCreateViewModel
{
    [Required(ErrorMessage = "Marka seçimi zorunludur.")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Şube seçimi zorunludur.")]
    public int CurrentLocationId { get; set; }

    [Required(ErrorMessage = "Model zorunludur.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Model adı 1-100 karakter olmalıdır.")]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yıl zorunludur.")]
    [Range(2000, 2100, ErrorMessage = "Geçerli bir yıl giriniz.")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Plaka zorunludur.")]
    [RegularExpression(@"^(0[1-9]|[1-7][0-9]|8[0-1])\s?[A-Z]{1,3}\s?[0-9]{2,4}$", 
        ErrorMessage = "Geçerli bir Türkiye plakası giriniz (Örn: 34 ABC 123)")]
    public string Plate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Günlük fiyat zorunludur.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Günlük fiyat 0'dan büyük olmalıdır.")]
    public decimal DailyPrice { get; set; }

    [Range(0, 1900, ErrorMessage = "Findeks puanı 0-1900 arasında olmalıdır.")]
    public int MinFindeksScore { get; set; }

    public CarStatus Status { get; set; } = CarStatus.Available;

    [FileExtensions(Extensions = "jpg,jpeg,png,gif", ErrorMessage = "Sadece jpg, jpeg, png, gif dosyaları yüklenebilir.")]
    public IFormFile? ImageFile { get; set; }
}

/// <summary>
/// Araç güncelleme formunda kullanılacak
/// </summary>
public class CarUpdateViewModel
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "Marka seçimi zorunludur.")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Şube seçimi zorunludur.")]
    public int CurrentLocationId { get; set; }

    [Required(ErrorMessage = "Model zorunludur.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Model adı 1-100 karakter olmalıdır.")]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yıl zorunludur.")]
    [Range(2000, 2100, ErrorMessage = "Geçerli bir yıl giriniz.")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Plaka zorunludur.")]
    [RegularExpression(@"^(0[1-9]|[1-7][0-9]|8[0-1])\s?[A-Z]{1,3}\s?[0-9]{2,4}$", 
        ErrorMessage = "Geçerli bir Türkiye plakası giriniz (Örn: 34 ABC 123)")]
    public string Plate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Günlük fiyat zorunludur.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Günlük fiyat 0'dan büyük olmalıdır.")]
    public decimal DailyPrice { get; set; }

    [Range(0, 1900, ErrorMessage = "Findeks puanı 0-1900 arasında olmalıdır.")]
    public int MinFindeksScore { get; set; }

    public CarStatus Status { get; set; }

    // Mevcut resim URL'i (düzenleme anında gösterim için)
    public string? CurrentImageUrl { get; set; }

    [FileExtensions(Extensions = "jpg,jpeg,png,gif", ErrorMessage = "Sadece jpg, jpeg, png, gif dosyaları yüklenebilir.")]
    public IFormFile? ImageFile { get; set; }
}

/// <summary>
/// Sayfalanmış araç listesi için helper
/// </summary>
public class CarPaginatedViewModel
{
    public List<CarListViewModel> Cars { get; set; } = new();
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}