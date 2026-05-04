using RentACar.Application.DTOs.Rental;
using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class RentalListViewModel
{
    public PagedResult<RentalDto> Rentals { get; set; } = new();
}

public class RentalCreateViewModel
{
    [Required(ErrorMessage = "Müşteri seçimi zorunludur.")]
    public int CustomerId { get; set; }

    [Required(ErrorMessage = "Araç seçimi zorunludur.")]
    public int CarId { get; set; }

    [Required(ErrorMessage = "Alış şubesi zorunludur.")]
    public int PickUpLocationId { get; set; }

    [Required(ErrorMessage = "Dönüş şubesi zorunludur.")]
    public int DropOffLocationId { get; set; }

    [Required(ErrorMessage = "Alış tarihi zorunludur.")]
    public DateTime RentStartDate { get; set; } = DateTime.Now;

    [Required(ErrorMessage = "Dönüş tarihi zorunludur.")]
    public DateTime RentEndDate { get; set; } = DateTime.Now.AddDays(1);
}