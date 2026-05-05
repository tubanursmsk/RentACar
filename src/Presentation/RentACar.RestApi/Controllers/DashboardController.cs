using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,CompanyManager,Staff")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // GET /api/Dashboard/Stats
    [HttpGet("Stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _dashboardService.GetStatsAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/RevenueTrend?days=30
    [HttpGet("RevenueTrend")]
    public async Task<IActionResult> GetRevenueTrend([FromQuery] int days = 30)
    {
        if (days < 1 || days > 365) days = 30;
        var result = await _dashboardService.GetRevenueTrendAsync(days);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/CarStatusBreakdown
    [HttpGet("CarStatusBreakdown")]
    public async Task<IActionResult> GetCarStatusBreakdown()
    {
        var result = await _dashboardService.GetCarStatusBreakdownAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/RecentRentals?count=5
    [HttpGet("RecentRentals")]
    public async Task<IActionResult> GetRecentRentals([FromQuery] int count = 5)
    {
        if (count < 1 || count > 50) count = 5;
        var result = await _dashboardService.GetRecentRentalsAsync(count);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/TopCars?count=5
    [HttpGet("TopCars")]
    public async Task<IActionResult> GetTopCars([FromQuery] int count = 5)
    {
        if (count < 1 || count > 50) count = 5;
        var result = await _dashboardService.GetTopCarsAsync(count);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/LocationOccupancy
    [HttpGet("LocationOccupancy")]
    public async Task<IActionResult> GetLocationOccupancy()
    {
        var result = await _dashboardService.GetLocationOccupancyAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/Notifications?count=10
    [HttpGet("Notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] int count = 10)
    {
        if (count < 1 || count > 50) count = 10;
        var result = await _dashboardService.GetNotificationsAsync(count);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // GET /api/Dashboard/Overview  ← TEK SEFERDE TÜM VERİ
    [HttpGet("Overview")]
    public async Task<IActionResult> GetOverview()
    {
        var result = await _dashboardService.GetOverviewAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }
}