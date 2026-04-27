using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

// ── Liste için ──────────────────────────────────────────────────
public class CarListViewModel
{
    public List<CarItemViewModel> Cars { get; set; } = new();
    public int TotalCount   { get; set; }
    public int PageNumber   { get; set; } = 1;
    public int PageSize     { get; set; } = 10;
    public int TotalPages   => (int)Math.Ceiling(TotalCount / (double)PageSize);

    // Dropdown veriler (Create/Edit modalı için)
    public List<SelectItem> Brands    { get; set; } = new();
    public List<SelectItem> Locations { get; set; } = new();
}

public class SelectItem
{
    public int    Id   { get; set; }
    public string Name { get; set; } = string.Empty;
}

// ── Tek araç satırı ────────────────────────────────────────────
public class CarItemViewModel
{
    public int     Id                  { get; set; }
    public string  BrandName           { get; set; } = string.Empty;
    public string  Model               { get; set; } = string.Empty;
    public int     Year                { get; set; }
    public string  Plate               { get; set; } = string.Empty;
    public decimal DailyPrice          { get; set; }
    public int     MinFindeksScore     { get; set; }
    public string  CurrentLocationName { get; set; } = string.Empty;
    public string  Status             { get; set; } = string.Empty;
    public string? ImageUrl            { get; set; }
    public int     BrandId             { get; set; }
    public int     CurrentLocationId   { get; set; }
}

// ── Ekleme formu ───────────────────────────────────────────────
public class CarCreateViewModel
{
    [Required(ErrorMessage = "Marka zorunludur.")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Şube zorunludur.")]
    public int CurrentLocationId { get; set; }

    [Required(ErrorMessage = "Model zorunludur.")]
    public string Model { get; set; } = string.Empty;

    [Range(2000, 2100, ErrorMessage = "Geçerli bir yıl giriniz.")]
    public int Year { get; set; } = DateTime.Now.Year;

    [Required(ErrorMessage = "Plaka zorunludur.")]
    public string Plate { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Günlük fiyat 0'dan küçük olamaz.")]
    public decimal DailyPrice { get; set; }

    [Range(0, 1900, ErrorMessage = "Findeks puanı 0-1900 arasında olmalıdır.")]
    public int MinFindeksScore { get; set; }

    // Resim yükleme
    public IFormFile? Image { get; set; }
}

// ── Düzenleme formu ────────────────────────────────────────────
public class CarEditViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Marka zorunludur.")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Şube zorunludur.")]
    public int CurrentLocationId { get; set; }

    [Required(ErrorMessage = "Model zorunludur.")]
    public string Model { get; set; } = string.Empty;

    [Range(2000, 2100, ErrorMessage = "Geçerli bir yıl giriniz.")]
    public int Year { get; set; }

    [Required(ErrorMessage = "Plaka zorunludur.")]
    public string Plate { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Günlük fiyat 0'dan küçük olamaz.")]
    public decimal DailyPrice { get; set; }

    [Range(0, 1900, ErrorMessage = "Findeks puanı 0-1900 arasında olmalıdır.")]
    public int MinFindeksScore { get; set; }

    public string Status { get; set; } = "Available";

    public string? ExistingImageUrl { get; set; }
    public IFormFile? Image { get; set; }
}