namespace RentACar.Domain.Entities
{
    public class Car : BaseEntity
    {
        public int BrandId { get; set; }
        public Brand Brand { get; set; } = null!; // İlişki

        public int CurrentLocationId { get; set; }
        public Location CurrentLocation { get; set; } = null!; // Aracın şu anki şubesi

        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Plate { get; set; } = string.Empty;
        public decimal DailyPrice { get; set; }
        public int MinFindeksScore { get; set; } // Bu araç için gereken minimum Findeks kredi notu 
        
        public CarStatus Status { get; set; } = CarStatus.Available;
        public string? ImageUrl { get; set; }
    }

    public enum CarStatus
    {
        Available = 1, // Müsait
        Rented = 2, // Kirada
        InMaintenance = 3, // Bakımda
        Passive = 4 // Pasif (örneğin, satışta veya kullanımdan kaldırılmış)
    }
}