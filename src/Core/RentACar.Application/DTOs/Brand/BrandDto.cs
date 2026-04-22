using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Brand;

public class BrandDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

