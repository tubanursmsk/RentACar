namespace RentACar.Domain.Entities;

public class InsurancePackage : BaseEntity
{
    public string Name { get; set; } = string.Empty;          // "Mini Güvence", "Orta Güvence", "Full Güvence"
    public string Code { get; set; } = string.Empty;          // "MINI", "ORTA", "FULL"
    public decimal DailyPrice { get; set; }                   // Günlük fiyat
    public string Description { get; set; } = string.Empty;   // Kısa açıklama
    public int DisplayOrder { get; set; }                     // Sıralama
    public bool IsRecommended { get; set; }                   // "En Popüler" rozeti

    // Hangi özellikleri kapsıyor (JSON formatında saklanır)
    public string FeaturesJson { get; set; } = "[]";

    // Many-to-many: Bir paket birçok rezervasyonda kullanılabilir
    public ICollection<Rental> Rentals { get; set; } = new List<Rental>();
}
