
namespace RentACar.Domain.Entities;

// Rental ile AdditionalProduct arasında Many-to-Many + adet bilgisi
public class RentalAdditionalProduct : BaseEntity
{
    public int RentalId { get; set; }
    public Rental Rental { get; set; } = null!;

    public int AdditionalProductId { get; set; }
    public AdditionalProduct AdditionalProduct { get; set; } = null!;

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }         // Anlık fiyat snapshot (sonradan ürün fiyatı değişse de bu kalır)
    public decimal TotalPrice { get; set; }        // UnitPrice * Quantity * Days
}
