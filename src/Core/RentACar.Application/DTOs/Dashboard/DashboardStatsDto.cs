namespace RentACar.Application.DTOs.Dashboard;

// ── Ana istatistik kartları için (zenginleştirilmiş) ──
public class DashboardStatsDto
{
    public int TotalCars { get; set; }
    public int ActiveRentedCars { get; set; }
    public int PendingReservations { get; set; }
    public int TotalCustomers { get; set; }

    // Trend bilgileri (geçen aya göre değişim)
    public int CarsAddedThisMonth { get; set; }
    public int RentalsCompletedThisMonth { get; set; }
    public int NewCustomersThisMonth { get; set; }
    public decimal RevenueThisMonth { get; set; }

    // Yüzdesel değişim (geçen aya göre)
    public double CarsTrendPercent { get; set; }
    public double RentalsTrendPercent { get; set; }
    public double CustomersTrendPercent { get; set; }
    public double RevenueTrendPercent { get; set; }
}

// ── Son 30 günün gelir/kiralama trendi (line chart) ──
public class RevenueTrendDto
{
    public List<RevenueDataPointDto> DataPoints { get; set; } = new();
    public decimal TotalRevenue { get; set; }
    public int TotalRentalsCount { get; set; }
}

public class RevenueDataPointDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int RentalCount { get; set; }
}

// ── Araç durum dağılımı (donut chart) ──
public class CarStatusBreakdownDto
{
    public int Available { get; set; }
    public int Rented { get; set; }
    public int InMaintenance { get; set; }
    public int Passive { get; set; }
    public int Total { get; set; }
}

// ── Son kiralamalar listesi ──
public class RecentRentalDto
{
    public int Id { get; set; }
    public string CustomerFullName { get; set; } = string.Empty;
    public string CarInfo { get; set; } = string.Empty;
    public DateTime RentStartDate { get; set; }
    public DateTime RentEndDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}

// ── En çok kiralanan araçlar ──
public class TopCarDto
{
    public int CarId { get; set; }
    public string CarInfo { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public string Plate { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int RentalCount { get; set; }
    public decimal TotalRevenue { get; set; }
}

// ── Şube doluluk oranı ──
public class LocationOccupancyDto
{
    public int LocationId { get; set; }
    public string LocationName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public int TotalCars { get; set; }
    public int RentedCars { get; set; }
    public double OccupancyRate { get; set; } // 0-100
}

// ── Bildirim akışı ──
public class NotificationDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // rental, car, maintenance, customer
    public string Icon { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string TimeAgo { get; set; } = string.Empty; // "5 dakika önce"
}

// ── Tüm dashboard verisi tek seferde ──
public class DashboardOverviewDto
{
    public DashboardStatsDto Stats { get; set; } = new();
    public RevenueTrendDto RevenueTrend { get; set; } = new();
    public CarStatusBreakdownDto CarStatusBreakdown { get; set; } = new();
    public List<RecentRentalDto> RecentRentals { get; set; } = new();
    public List<TopCarDto> TopCars { get; set; } = new();
    public List<LocationOccupancyDto> LocationOccupancy { get; set; } = new();
    public List<NotificationDto> Notifications { get; set; } = new();
}