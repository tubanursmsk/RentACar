using RentACar.Domain.Entities;
using RentACar.Application.DTOs.AdditionalProducts;
using RentACar.Application.DTOs.Insurance;

namespace RentACar.Application.DTOs.Rental;

public class RentalDto
{
    public int Id { get; set; }
    public int CarId { get; set; }
    public string CarInfo { get; set; } = string.Empty; // Örn: "Audi A3 - 34TY114"
    public string CustomerFullName { get; set; } = string.Empty;
    public string PickUpLocationName { get; set; } = string.Empty;
    public string DropOffLocationName { get; set; } = string.Empty;
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public ReservationStatus Status { get; set; }
}

// ────────────────────────────────────────
// REZERVASYON OLUŞTURMA (Wizard'dan gelir)
// ────────────────────────────────────────
public class CreateReservationDto
{
    // Step 1: Araç + tarih (anasayfa booking card'tan gelir)
    public int CarId { get; set; }
    public int PickUpLocationId { get; set; }
    public int DropOffLocationId { get; set; }
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }

    // Step 2: Sigorta (opsiyonel)
    public int? InsurancePackageId { get; set; }

    // Step 3: Ek ürünler (opsiyonel)
    public List<ReservationAdditionalProductDto> AdditionalProducts { get; set; } = new();

    // Step 4: Sürücü bilgileri
    public string DriverIdentityNumber { get; set; } = string.Empty;
    public string DriverFirstName { get; set; } = string.Empty;
    public string DriverLastName { get; set; } = string.Empty;
    public string DriverBirthDate { get; set; } = string.Empty;
    public string DriverLicenseNumber { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string DriverEmail { get; set; } = string.Empty;
    public string DriverAddress { get; set; } = string.Empty;
}

public class ReservationAdditionalProductDto
{
    public int AdditionalProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

// ────────────────────────────────────────
// PRICE PREVIEW (Wizard fiyat hesaplama)
// ────────────────────────────────────────
public class PricePreviewRequestDto
{
    public int CarId { get; set; }
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public int? InsurancePackageId { get; set; }
    public List<ReservationAdditionalProductDto> AdditionalProducts { get; set; } = new();
}

public class PricePreviewDto
{
    public int TotalDays { get; set; }
    public decimal CarDailyPrice { get; set; }
    public decimal SubTotal { get; set; }                       // Araç toplamı
    public decimal InsuranceTotal { get; set; }
    public decimal AdditionalProductsTotal { get; set; }
    public decimal GrandTotal { get; set; }

    public List<PriceLineDto> Lines { get; set; } = new();
}

public class PriceLineDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Detail { get; set; }    // örn. "2 gün x ₺500"
}

// ────────────────────────────────────────
// REZERVASYON DETAY
// ────────────────────────────────────────
public class ReservationDetailDto
{
    public int Id { get; set; }
    public string CarInfo { get; set; } = string.Empty;
    public string? CarImageUrl { get; set; }
    public string PickUpLocationName { get; set; } = string.Empty;
    public string DropOffLocationName { get; set; } = string.Empty;
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public int TotalDays { get; set; }

      // ── YENİ: Rezervasyon Yönetimi ──
    public string? ReservationCode { get; set; }
    public string? CancelReason { get; set; }
    public DateTime? CancelledDate { get; set; }
 
    // ── YENİ: Aksiyon İzinleri (Frontend'in "İptal Et"/"Düzenle" butonları için) ──
    public bool CanCancel { get; set; }
    public bool CanEdit { get; set; }
    public string? CannotCancelReason { get; set; }
    public int? HoursUntilPickup { get; set; }
 

    public InsurancePackageDto? InsurancePackage { get; set; }
    public List<ReservationProductDetailDto> AdditionalProducts { get; set; } = new();

    public decimal SubTotal { get; set; }
    public decimal InsuranceTotal { get; set; }
    public decimal AdditionalProductsTotal { get; set; }
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = string.Empty;
    public bool IsPaid { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class ReservationProductDetailDto
{
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
