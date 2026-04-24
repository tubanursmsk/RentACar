using RentACar.Application.DTOs.Dashboard;
using RentACar.Application.DTOs.Responses;
namespace RentACar.Application.Interfaces;
public interface IDashboardService
{
    Task<ApiResponse<DashboardStatsDto>> GetStatsAsync();
}