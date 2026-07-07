using RentACar.Domain.Entities;

namespace RentACar.Application.DTOs.Car;

public class CarDto
{
    public int Id { get; set; }
    public int BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;

    public int CurrentLocationId { get; set; }
    public string CurrentLocationName { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Plate { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }

    // Araç Özellikleri
    public int FuelType { get; set; }
    public int TransmissionType { get; set; }
    public int SeatCount { get; set; }
    public int DoorCount { get; set; }
    public int LuggageCount { get; set; }
    public string? Color { get; set; }
    public int? Mileage { get; set; }
    public string? Description { get; set; }

    // Ek özellikler
    public bool HasAirbag { get; set; }
    public bool HasAbs { get; set; }
    public bool HasAirConditioning { get; set; }
    public bool HasBluetooth { get; set; }
    public bool HasNavigation { get; set; }

    // Kiralama Koşulları
    public int MinFindeksScore { get; set; }
    public int MinDriverAge { get; set; }
    public int MinLicenseYears { get; set; }

    public CarStatus Status { get; set; }
    public string? ImageUrl { get; set; }

    public List<CarImageDto>? CarImages { get; set; }
}

public class CarImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; }
}