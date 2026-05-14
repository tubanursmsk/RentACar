
namespace RentACar.Domain.Entities;

public class AdditionalProduct : BaseEntity
{
    public string Name { get; set; } = string.Empty;          // "Çocuk Koltuğu", "Ek Sürücü", vs.
    public string Code { get; set; } = string.Empty;          // "CHILD_SEAT", "EXTRA_DRIVER", vs.
    public string Description { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }                   // Birim günlük fiyat
    public string IconName { get; set; } = string.Empty;      // FA icon adı (örn: "fa-baby")
    public bool IsQuantityBased { get; set; }                 // True: adetli (çocuk koltuğu), False: sabit (ek sürücü)
    public int MaxQuantity { get; set; } = 1;                 // Maks adet (varsa)
    public int DisplayOrder { get; set; }

    public ICollection<AdditionalProduct> RentalProducts { get; set; } = new List<AdditionalProduct>();
}
