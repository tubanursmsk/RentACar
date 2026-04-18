using RentACar.Domain.Entities;

namespace RentACar.Application.DTOs.Car
{
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
        public int MinFindeksScore { get; set; }
        public CarStatus Status { get; set; }
        public string? ImageUrl { get; set; }
    }
}