using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Location;

public class LocationDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
