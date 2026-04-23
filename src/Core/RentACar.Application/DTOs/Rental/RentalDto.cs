using RentACar.Domain.Entities;

namespace RentACar.Application.DTOs.Rental;

public class RentalDto
{
    public int Id { get; set; }
    public int CarId { get; set; }
    public string CarInfo { get; set; } = string.Empty; // Örn: "Audi A3 - 34TY114"
    public string CustomerFullName { get; set; } = string.Empty;
    public string PickUpLocationName { get; set; } = string.Empty;
    public string DropOffLocationName { get; set; } = string.Empty;
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public ReservationStatus Status { get; set; }
}