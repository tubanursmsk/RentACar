using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Dashboard;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // ── ANA İSTATİSTİKLER (zenginleştirilmiş) ──
    public async Task<ApiResponse<DashboardStatsDto>> GetStatsAsync()
    {
        var now = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1);
        var lastMonthStart = thisMonthStart.AddMonths(-1);
        var lastMonthEnd = thisMonthStart.AddSeconds(-1);

        var carRepo = _unitOfWork.Repository<Car>();
        var rentalRepo = _unitOfWork.Repository<Rental>();
        var customerRepo = _unitOfWork.Repository<Customer>();

        // Genel toplamlar
        var totalCars = await carRepo.GetWhere(c => !c.IsDeleted).CountAsync();
        var activeRented = await carRepo.GetWhere(c => !c.IsDeleted && c.Status == CarStatus.Rented).CountAsync();
        var pending = await rentalRepo.GetWhere(r => !r.IsDeleted && r.Status == ReservationStatus.Pending).CountAsync();
        var totalCustomers = await customerRepo.GetWhere(c => !c.IsDeleted).CountAsync();

        // Bu ay ekleme/tamamlanma sayıları
        var carsThisMonth = await carRepo.GetWhere(c => !c.IsDeleted && c.CreatedDate >= thisMonthStart).CountAsync();
        var rentalsThisMonth = await rentalRepo.GetWhere(r => !r.IsDeleted &&
            r.Status == ReservationStatus.Completed && r.UpdatedDate >= thisMonthStart).CountAsync();
        var customersThisMonth = await customerRepo.GetWhere(c => !c.IsDeleted && c.CreatedDate >= thisMonthStart).CountAsync();

        // Bu ay gelir
        var revenueThisMonth = await rentalRepo.GetWhere(r => !r.IsDeleted &&
            r.Status == ReservationStatus.Completed && r.UpdatedDate >= thisMonthStart)
            .SumAsync(r => (decimal?)r.TotalAmount) ?? 0m;

        // Geçen ay verileri (trend için)
        var carsLastMonth = await carRepo.GetWhere(c => !c.IsDeleted &&
            c.CreatedDate >= lastMonthStart && c.CreatedDate <= lastMonthEnd).CountAsync();
        var rentalsLastMonth = await rentalRepo.GetWhere(r => !r.IsDeleted &&
            r.Status == ReservationStatus.Completed &&
            r.UpdatedDate >= lastMonthStart && r.UpdatedDate <= lastMonthEnd).CountAsync();
        var customersLastMonth = await customerRepo.GetWhere(c => !c.IsDeleted &&
            c.CreatedDate >= lastMonthStart && c.CreatedDate <= lastMonthEnd).CountAsync();
        var revenueLastMonth = await rentalRepo.GetWhere(r => !r.IsDeleted &&
            r.Status == ReservationStatus.Completed &&
            r.UpdatedDate >= lastMonthStart && r.UpdatedDate <= lastMonthEnd)
            .SumAsync(r => (decimal?)r.TotalAmount) ?? 0m;

        var stats = new DashboardStatsDto
        {
            TotalCars = totalCars,
            ActiveRentedCars = activeRented,
            PendingReservations = pending,
            TotalCustomers = totalCustomers,
            CarsAddedThisMonth = carsThisMonth,
            RentalsCompletedThisMonth = rentalsThisMonth,
            NewCustomersThisMonth = customersThisMonth,
            RevenueThisMonth = revenueThisMonth,
            CarsTrendPercent = CalculateTrend(carsThisMonth, carsLastMonth),
            RentalsTrendPercent = CalculateTrend(rentalsThisMonth, rentalsLastMonth),
            CustomersTrendPercent = CalculateTrend(customersThisMonth, customersLastMonth),
            RevenueTrendPercent = CalculateTrend((double)revenueThisMonth, (double)revenueLastMonth)
        };

        return ApiResponse<DashboardStatsDto>.SuccessResult(stats, "İstatistikler hazır.");
    }

    // ── GELİR TRENDİ (line chart için) ──
    public async Task<ApiResponse<RevenueTrendDto>> GetRevenueTrendAsync(int days = 30)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days + 1);

        var completedRentals = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => !r.IsDeleted &&
                r.Status == ReservationStatus.Completed &&
                r.UpdatedDate >= startDate)
            .Select(r => new { r.UpdatedDate, r.TotalAmount })
            .ToListAsync();

        // Her gün için gruplama
        var dataPoints = new List<RevenueDataPointDto>();
        for (int i = 0; i < days; i++)
        {
            var date = startDate.AddDays(i);
            var dayRentals = completedRentals.Where(r =>
                r.UpdatedDate.HasValue &&
                r.UpdatedDate.Value.Date == date).ToList();

            dataPoints.Add(new RevenueDataPointDto
            {
                Date = date,
                Revenue = dayRentals.Sum(r => r.TotalAmount),
                RentalCount = dayRentals.Count
            });
        }

        var trend = new RevenueTrendDto
        {
            DataPoints = dataPoints,
            TotalRevenue = dataPoints.Sum(d => d.Revenue),
            TotalRentalsCount = dataPoints.Sum(d => d.RentalCount)
        };

        return ApiResponse<RevenueTrendDto>.SuccessResult(trend);
    }

    // ── ARAÇ DURUM DAĞILIMI (donut chart) ──
    public async Task<ApiResponse<CarStatusBreakdownDto>> GetCarStatusBreakdownAsync()
    {
        var cars = await _unitOfWork.Repository<Car>()
            .GetWhere(c => !c.IsDeleted)
            .Select(c => c.Status)
            .ToListAsync();

        var breakdown = new CarStatusBreakdownDto
        {
            Available = cars.Count(s => s == CarStatus.Available),
            Rented = cars.Count(s => s == CarStatus.Rented),
            InMaintenance = cars.Count(s => s == CarStatus.InMaintenance),
            Passive = cars.Count(s => s == CarStatus.Passive),
            Total = cars.Count
        };

        return ApiResponse<CarStatusBreakdownDto>.SuccessResult(breakdown);
    }

    // ── SON KİRALAMALAR ──
    public async Task<ApiResponse<List<RecentRentalDto>>> GetRecentRentalsAsync(int count = 5)
    {
        var rentals = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .OrderByDescending(r => r.CreatedDate)
            .Take(count)
            .ToListAsync();

        var dtos = rentals.Select(r => new RecentRentalDto
        {
            Id = r.Id,
            CustomerFullName = r.Customer?.User != null
                ? $"{r.Customer.User.FirstName} {r.Customer.User.LastName}"
                : "—",
            CarInfo = r.Car != null
                ? $"{r.Car.Brand?.Name} {r.Car.Model} — {r.Car.Plate}"
                : "—",
            RentStartDate = r.RentStartDate,
            RentEndDate = r.RentEndDate,
            TotalAmount = r.TotalAmount,
            Status = r.Status.ToString(),
            CreatedDate = r.CreatedDate
        }).ToList();

        return ApiResponse<List<RecentRentalDto>>.SuccessResult(dtos);
    }

    // ── EN ÇOK KİRALANAN ARAÇLAR ──
    public async Task<ApiResponse<List<TopCarDto>>> GetTopCarsAsync(int count = 5)
    {
        var topCars = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => !r.IsDeleted && r.Status == ReservationStatus.Completed)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .GroupBy(r => r.CarId)
            .Select(g => new
            {
                CarId = g.Key,
                Car = g.First().Car,
                RentalCount = g.Count(),
                TotalRevenue = g.Sum(r => r.TotalAmount)
            })
            .OrderByDescending(x => x.RentalCount)
            .Take(count)
            .ToListAsync();

        var dtos = topCars.Select(x => new TopCarDto
        {
            CarId = x.CarId,
            CarInfo = x.Car != null ? $"{x.Car.Brand?.Name} {x.Car.Model}" : "—",
            BrandName = x.Car?.Brand?.Name ?? "—",
            Plate = x.Car?.Plate ?? "—",
            ImageUrl = x.Car?.ImageUrl,
            RentalCount = x.RentalCount,
            TotalRevenue = x.TotalRevenue
        }).ToList();

        return ApiResponse<List<TopCarDto>>.SuccessResult(dtos);
    }

    // ── ŞUBE DOLULUK ORANI ──
    public async Task<ApiResponse<List<LocationOccupancyDto>>> GetLocationOccupancyAsync()
    {
        var locations = await _unitOfWork.Repository<Location>()
            .GetWhere(l => !l.IsDeleted)
            .ToListAsync();

        var cars = await _unitOfWork.Repository<Car>()
            .GetWhere(c => !c.IsDeleted)
            .Select(c => new { c.CurrentLocationId, c.Status })
            .ToListAsync();

        var dtos = locations.Select(loc =>
        {
            var locationCars = cars.Where(c => c.CurrentLocationId == loc.Id).ToList();
            var total = locationCars.Count;
            var rented = locationCars.Count(c => c.Status == CarStatus.Rented);

            return new LocationOccupancyDto
            {
                LocationId = loc.Id,
                LocationName = loc.Name,
                City = loc.City,
                TotalCars = total,
                RentedCars = rented,
                OccupancyRate = total > 0 ? Math.Round((double)rented / total * 100, 1) : 0
            };
        })
        .OrderByDescending(d => d.OccupancyRate)
        .ToList();

        return ApiResponse<List<LocationOccupancyDto>>.SuccessResult(dtos);
    }

    // ── BİLDİRİM AKIŞI ──
    public async Task<ApiResponse<List<NotificationDto>>> GetNotificationsAsync(int count = 10)
    {
        var notifications = new List<NotificationDto>();

        // Son rezervasyonlar
        var recentRentals = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .OrderByDescending(r => r.CreatedDate)
            .Take(count)
            .ToListAsync();

        foreach (var r in recentRentals)
        {
            string title, icon, type;
            switch (r.Status)
            {
                case ReservationStatus.Pending:
                    title = "Yeni rezervasyon talebi";
                    icon = "fa-clock";
                    type = "rental";
                    break;
                case ReservationStatus.Approved:
                    title = "Rezervasyon onaylandı";
                    icon = "fa-check-circle";
                    type = "rental";
                    break;
                case ReservationStatus.Completed:
                    title = "Araç teslim alındı";
                    icon = "fa-flag-checkered";
                    type = "rental";
                    break;
                default:
                    title = "Rezervasyon güncellendi";
                    icon = "fa-rotate";
                    type = "rental";
                    break;
            }

            var customerName = r.Customer?.User != null
                ? $"{r.Customer.User.FirstName} {r.Customer.User.LastName}"
                : "Müşteri";
            var carInfo = r.Car != null
                ? $"{r.Car.Brand?.Name} {r.Car.Model}"
                : "Araç";

            notifications.Add(new NotificationDto
            {
                Id = r.Id,
                Type = type,
                Icon = icon,
                Title = title,
                Message = $"{customerName} → {carInfo}",
                CreatedDate = r.CreatedDate,
                TimeAgo = GetTimeAgo(r.CreatedDate)
            });
        }

        // Son eklenen araçlar (uyarı niteliğinde)
        var recentCars = await _unitOfWork.Repository<Car>()
            .GetWhere(c => !c.IsDeleted)
            .Include(c => c.Brand)
            .OrderByDescending(c => c.CreatedDate)
            .Take(3)
            .ToListAsync();

        foreach (var c in recentCars)
        {
            notifications.Add(new NotificationDto
            {
                Id = c.Id,
                Type = "car",
                Icon = "fa-car",
                Title = "Yeni araç eklendi",
                Message = $"{c.Brand?.Name} {c.Model} — {c.Plate}",
                CreatedDate = c.CreatedDate,
                TimeAgo = GetTimeAgo(c.CreatedDate)
            });
        }

        // En yeniler önce
        notifications = notifications
            .OrderByDescending(n => n.CreatedDate)
            .Take(count)
            .ToList();

        return ApiResponse<List<NotificationDto>>.SuccessResult(notifications);
    }

    // ── TÜM DASHBOARD VERİSİ TEK SEFERDE ──
    public async Task<ApiResponse<DashboardOverviewDto>> GetOverviewAsync()
    {
        var statsTask = GetStatsAsync();
        var revenueTask = GetRevenueTrendAsync(30);
        var statusTask = GetCarStatusBreakdownAsync();
        var recentTask = GetRecentRentalsAsync(5);
        var topCarsTask = GetTopCarsAsync(5);
        var occupancyTask = GetLocationOccupancyAsync();
        var notificationsTask = GetNotificationsAsync(10);

        // Sıralı çağrı (UnitOfWork DbContext concurrency'i önlemek için)
        var stats = await statsTask;
        var revenue = await revenueTask;
        var status = await statusTask;
        var recent = await recentTask;
        var topCars = await topCarsTask;
        var occupancy = await occupancyTask;
        var notifications = await notificationsTask;

        var overview = new DashboardOverviewDto
        {
            Stats = stats.Data ?? new DashboardStatsDto(),
            RevenueTrend = revenue.Data ?? new RevenueTrendDto(),
            CarStatusBreakdown = status.Data ?? new CarStatusBreakdownDto(),
            RecentRentals = recent.Data ?? new List<RecentRentalDto>(),
            TopCars = topCars.Data ?? new List<TopCarDto>(),
            LocationOccupancy = occupancy.Data ?? new List<LocationOccupancyDto>(),
            Notifications = notifications.Data ?? new List<NotificationDto>()
        };

        return ApiResponse<DashboardOverviewDto>.SuccessResult(overview, "Dashboard verisi yüklendi.");
    }

    // ── HELPERS ──
    private static double CalculateTrend(double current, double previous)
    {
        if (previous == 0) return current > 0 ? 100 : 0;
        return Math.Round(((current - previous) / previous) * 100, 1);
    }

    private static double CalculateTrend(int current, int previous) =>
        CalculateTrend((double)current, (double)previous);

    private static string GetTimeAgo(DateTime dateTime)
    {
        var diff = DateTime.UtcNow - dateTime.ToUniversalTime();
        if (diff.TotalMinutes < 1) return "az önce";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} dakika önce";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} saat önce";
        if (diff.TotalDays < 7) return $"{(int)diff.TotalDays} gün önce";
        if (diff.TotalDays < 30) return $"{(int)(diff.TotalDays / 7)} hafta önce";
        return dateTime.ToString("dd MMM yyyy");
    }
}