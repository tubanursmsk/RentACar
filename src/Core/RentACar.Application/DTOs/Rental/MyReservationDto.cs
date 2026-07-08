namespace RentACar.Application.DTOs.Rental;

/// <summary>
/// "Rezervasyonlarım" sayfasındaki kart görünümü için özet DTO.
/// Detay için ReservationDetailDto kullanılır.
/// </summary>
public class MyReservationDto
{
    public int Id { get; set; }
    public string? ReservationCode { get; set; }

    // Araç
    public int CarId { get; set; }
    public string CarBrand { get; set; } = string.Empty;
    public string CarModel { get; set; } = string.Empty;
    public string CarPlate { get; set; } = string.Empty;
    public string? CarImageUrl { get; set; }

    // Tarih & Ofis
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public int TotalDays { get; set; }
    public string PickUpLocationName { get; set; } = string.Empty;
    public string DropOffLocationName { get; set; } = string.Empty;

    // Fiyat & Durum
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;   // "Pending" | "Approved" | "Completed" | "Cancelled"
    public bool IsPaid { get; set; }

    // Aksiyon izinleri (backend hesaplar)
    public bool CanCancel { get; set; }
    public bool CanEdit { get; set; }
    public int? HoursUntilPickup { get; set; }   // Alışa kaç saat kaldı (null = geçti)

    public DateTime CreatedDate { get; set; }
}
