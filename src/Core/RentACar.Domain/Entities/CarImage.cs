using System.ComponentModel.DataAnnotations.Schema;

namespace RentACar.Domain.Entities;

public class CarImage : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; } // Ana resim mi?
    public int CarId { get; set; }
    [ForeignKey("CarId")]
    public Car Car { get; set; } = null!;
}