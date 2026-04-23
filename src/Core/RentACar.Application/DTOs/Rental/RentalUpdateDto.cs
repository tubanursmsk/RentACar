using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Rental;

public class RentalUpdateDto
{
    [Required(ErrorMessage = "Araç seçimi zorunludur.")]
    public int CarId { get; set; }

    [Required(ErrorMessage = "Alış şubesi zorunludur.")]
    public int PickUpLocationId { get; set; }

    [Required(ErrorMessage = "Dönüş şubesi zorunludur.")]
    public int DropOffLocationId { get; set; }

    [Required(ErrorMessage = "Alış tarihi zorunludur.")]
    public DateTime RentStartDate { get; set; }

    [Required(ErrorMessage = "Dönüş tarihi zorunludur.")]
    public DateTime RentEndDate { get; set; }
}