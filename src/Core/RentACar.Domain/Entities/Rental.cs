namespace RentACar.Domain.Entities;
public enum ReservationStatus
{
    Pending = 1,
    Approved = 2,
    Completed = 3,
    Cancelled = 4
}

public class Rental : BaseEntity
{
    // ── Mevcut alanlar ──
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public int CarId { get; set; }
    public Car Car { get; set; } = null!;

    public int PickUpLocationId { get; set; }
    public Location PickUpLocation { get; set; } = null!;

    public int DropOffLocationId { get; set; }
    public Location DropOffLocation { get; set; } = null!;

    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public DateTime? ReturnDate { get; set; }

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public bool IsPaid { get; set; }

    // ── YENİ: Fiyat detayları ──
    public decimal SubTotal { get; set; }                         // Sadece araç (gün × günlükFiyat)
    public decimal InsuranceTotal { get; set; }                   // Sigorta toplamı
    public decimal AdditionalProductsTotal { get; set; }          // Ek ürünler toplamı
    public decimal TotalAmount { get; set; }                      // Genel toplam (TÜM toplamlar)

    // ── YENİ: Sigorta paketi ──
    public int? InsurancePackageId { get; set; }
    public InsurancePackage? InsurancePackage { get; set; }

    // ── YENİ: Ek ürünler ──
    public ICollection<RentalAdditionalProduct> AdditionalProducts { get; set; } = new List<RentalAdditionalProduct>();

    // ── YENİ: Sürücü bilgileri (KVKK uyumlu — gerekirse encrypt edilebilir) ──
    public string? DriverIdentityNumber { get; set; }             // TC Kimlik
    public string? DriverFirstName { get; set; }
    public string? DriverLastName { get; set; }
    public string? DriverBirthDate { get; set; }
    public string? DriverLicenseNumber { get; set; }              // Ehliyet No
    public string? DriverPhone { get; set; }
    public string? DriverEmail { get; set; }
    public string? DriverAddress { get; set; }

    
    // ── YENİ: Rezervasyon Yönetimi ──
    public string? CancelReason { get; set; }
    public DateTime? CancelledDate { get; set; }
    public string? ReservationCode { get; set; }  // "RNT-2026-0001" gibi kısa referans kod (opsiyonel)

    // ── YENİ: Ödeme ──
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();

    // Yardımcı: Toplam kiralama günü
    public int TotalDays => Math.Max(1, (RentEndDate - RentStartDate).Days);
}
