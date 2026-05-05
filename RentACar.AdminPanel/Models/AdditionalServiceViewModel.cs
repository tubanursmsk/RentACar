using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class AdditionalServiceListViewModel
{
    public List<AdditionalServiceViewModel> Services { get; set; } = new();
}

public class AdditionalServiceViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public string CarSegment { get; set; } = "All";
}

public class AdditionalServiceCreateViewModel
{
    [Required(ErrorMessage = "Hizmet adı zorunludur.")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Günlük fiyat zorunludur.")]
    [Range(0, 100000, ErrorMessage = "Geçerli bir fiyat giriniz.")]
    public decimal DailyPrice { get; set; }

    [Required(ErrorMessage = "Geçerli segmenti seçmelisiniz.")]
    public string CarSegment { get; set; } = "All";

    // ÇOKLU SEÇİM İÇİN 
    [Required(ErrorMessage = "En az bir geçerli segment seçmelisiniz.")]
    public List<string> SelectedSegments { get; set; } = new();
}

public class AdditionalServiceEditViewModel : AdditionalServiceCreateViewModel
{
    public int Id { get; set; }
}