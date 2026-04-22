using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Location;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationController : ControllerBase
{
    private readonly ILocationService _LocationService;
    public LocationController(ILocationService LocationService) => _LocationService = LocationService;

    [HttpGet("Paged")]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10) 
        => Ok(await _LocationService.GetPagedLocationsAsync(pageNumber, pageSize));

    [HttpGet("All")]
    public async Task<IActionResult> GetAll() => Ok(await _LocationService.GetAllLocationsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) => Ok(await _LocationService.GetLocationByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = "Admin,CompanyManager,Staff")] // Sadece yetkili personel
    public async Task<IActionResult> Create(LocationCreateDto dto) => Ok(await _LocationService.CreateLocationAsync(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Update(int id, LocationUpdateDto dto)
    {
        dto.Id = id; // Güvenlik için URL'den gelen ID'yi DTO'ya basıyoruz
        return Ok(await _LocationService.UpdateLocationAsync(id, dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id) => Ok(await _LocationService.DeleteLocationAsync(id));
}