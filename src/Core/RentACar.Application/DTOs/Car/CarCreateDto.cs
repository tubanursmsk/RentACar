namespace RentACar.Application.DTOs.Car
{
    public class CarCreateDto
    {
        public int BrandId { get; set; } 
        public int CurrentLocationId { get; set; }
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Plate { get; set; } = string.Empty;
        public decimal DailyPrice { get; set; }
        public int MinFindeksScore { get; set; } 
        public string? ImageUrl { get; set; }
    }
}