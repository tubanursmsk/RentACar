using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,CompanyManager,Staff")] // Müşteriler istatistikleri göremez
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    public DashboardController(IDashboardService dashboardService) => _dashboardService = dashboardService;

    [HttpGet("Stats")]
    public async Task<IActionResult> GetStats()
    {
        return Ok(await _dashboardService.GetStatsAsync());
    }
}