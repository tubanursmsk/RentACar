using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Rental;

public class UpdateReservationDatesDto
{
    [Required(ErrorMessage = "Yeni alış tarihi zorunludur.")]
    public DateTime NewRentStartDate { get; set; }

    [Required(ErrorMessage = "Yeni iade tarihi zorunludur.")]
    public DateTime NewRentEndDate { get; set; }
}
