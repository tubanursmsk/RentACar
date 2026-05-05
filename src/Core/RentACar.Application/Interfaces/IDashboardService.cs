using RentACar.Application.DTOs.Dashboard;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IDashboardService
{
    Task<ApiResponse<DashboardStatsDto>> GetStatsAsync();
    Task<ApiResponse<RevenueTrendDto>> GetRevenueTrendAsync(int days = 30);
    Task<ApiResponse<CarStatusBreakdownDto>> GetCarStatusBreakdownAsync();
    Task<ApiResponse<List<RecentRentalDto>>> GetRecentRentalsAsync(int count = 5);
    Task<ApiResponse<List<TopCarDto>>> GetTopCarsAsync(int count = 5);
    Task<ApiResponse<List<LocationOccupancyDto>>> GetLocationOccupancyAsync();
    Task<ApiResponse<List<NotificationDto>>> GetNotificationsAsync(int count = 10);

    // Tek seferde tümünü getir (frontend tek istekle dolduracak)
    Task<ApiResponse<DashboardOverviewDto>> GetOverviewAsync();
}