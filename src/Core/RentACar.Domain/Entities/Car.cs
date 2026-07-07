namespace RentACar.Domain.Entities
{
    public class Car : BaseEntity
    {
        public int BrandId { get; set; }
        public Brand Brand { get; set; } = null!;

        public int CurrentLocationId { get; set; }
        public Location CurrentLocation { get; set; } = null!;

        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Plate { get; set; } = string.Empty;
        public decimal DailyPrice { get; set; }

        // ═══ ARAÇ ÖZELLİKLERİ ═══
        public int FuelType { get; set; }           // 1:Benzin, 2:Dizel, 3:Elektrik, 4:Hibrit, 5:LPG
        public int TransmissionType { get; set; }   // 1:Manuel, 2:Otomatik, 3:YarıOtomatik
        public int SeatCount { get; set; } = 5;     // Kişi kapasitesi
        public int DoorCount { get; set; } = 4;     // Kapı sayısı
        public int LuggageCount { get; set; } = 2;  // Büyük bavul sayısı
        public string? Color { get; set; }          // Renk (Beyaz, Siyah, ...)
        public int? Mileage { get; set; }           // Kilometre
        public string? Description { get; set; }    // Açıklama (opsiyonel)

        // ═══ EK ÖZELLİKLER (checkbox) ═══
        public bool HasAirbag { get; set; } = true;
        public bool HasAbs { get; set; } = true;
        public bool HasAirConditioning { get; set; } = true;
        public bool HasBluetooth { get; set; } = false;
        public bool HasNavigation { get; set; } = false;

        // ═══ KİRALAMA KOŞULLARI ═══
        public int MinFindeksScore { get; set; }
        public int MinDriverAge { get; set; } = 21;    // Min. yaş sınırı
        public int MinLicenseYears { get; set; } = 1;  // Min. ehliyet yaşı

        // ═══ DURUM & MEDYA ═══
        public CarStatus Status { get; set; } = CarStatus.Available;
        public string? ImageUrl { get; set; }
        public ICollection<CarImage> CarImages { get; set; } = new List<CarImage>();
    }

    public enum CarStatus
    {
        Available = 1,      // Müsait
        Rented = 2,         // Kirada
        InMaintenance = 3,  // Bakımda
        Passive = 4         // Pasif
    }
}