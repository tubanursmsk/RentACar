namespace RentACar.Domain.Entities
{
    public class Rental : BaseEntity
    {
        public int CarId { get; set; }
        public Car Car { get; set; } = null!;
        public int CustomerId { get; set; } 
        public Customer Customer { get; set; } = null!;
        public int PickUpLocationId { get; set; } // Alış Şubesi
        public Location PickUpLocation { get; set; } = null!;
        public int DropOffLocationId { get; set; } // Dönüş Şubesi
        public Location DropOffLocation { get; set; } = null!;
        public DateTime RentStartDate { get; set; }
        public DateTime RentEndDate { get; set; }
        public DateTime? ReturnDate { get; set; } 
        public decimal TotalAmount { get; set; }
        public bool IsPaid { get; set; }

        // YÖNERGE EKLENTİSİ: Rezervasyon Durumları
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    }

    public enum ReservationStatus
    {
        Pending = 1,      // Beklemede / Provizyon
        Approved = 2,     // Onaylandı
        Completed = 3,    // Teslim Edildi (Bitti)
        Cancelled = 4     // İptal Edildi
    }
}