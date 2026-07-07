using Microsoft.AspNetCore.Http;
using RentACar.Domain.Entities;

namespace RentACar.Application.DTOs.Car;

public class CarUpdateDto
{
    public int Id { get; set; }
    public int BrandId { get; set; }
    public int CurrentLocationId { get; set; }
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Plate { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }

    // Araç Özellikleri
    public int FuelType { get; set; }
    public int TransmissionType { get; set; }
    public int SeatCount { get; set; } = 5;
    public int DoorCount { get; set; } = 4;
    public int LuggageCount { get; set; } = 2;
    public string? Color { get; set; }
    public int? Mileage { get; set; }
    public string? Description { get; set; }

    // Ek özellikler
    public bool HasAirbag { get; set; }
    public bool HasAbs { get; set; }
    public bool HasAirConditioning { get; set; }
    public bool HasBluetooth { get; set; }
    public bool HasNavigation { get; set; }

    // Kiralama koşulları
    public int MinFindeksScore { get; set; }
    public int MinDriverAge { get; set; } = 21;
    public int MinLicenseYears { get; set; } = 1;

    public CarStatus Status { get; set; }

    public List<IFormFile>? ImageFiles { get; set; }
}