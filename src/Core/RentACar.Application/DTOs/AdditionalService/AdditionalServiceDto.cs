using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.AdditionalService;

public class AdditionalServiceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
}
