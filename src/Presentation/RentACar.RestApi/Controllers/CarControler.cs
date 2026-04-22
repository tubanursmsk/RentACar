using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Car;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarController : ControllerBase
{
    private readonly ICarService _carService;
    public CarController(ICarService carService) => _carService = carService;

    // Herkese Açık: Müşteriler araç arayabilir
    [HttpPost("SearchAvailable")]
    public async Task<IActionResult> SearchAvailableCars([FromBody] AvailableCarSearchDto searchDto)
    {
        return Ok(await _carService.GetAvailableCarsAsync(searchDto));
    }

    // Herkese Açık: Tüm araçların vitrini (Sayfalamalı)
    [HttpGet("Paged")]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await _carService.GetPagedCarsAsync(pageNumber, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) => Ok(await _carService.GetCarByIdAsync(id));

    // Admin / Şube Çalışanı İşlemleri
    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Create([FromBody] CarCreateDto dto) => Ok(await _carService.CreateCarAsync(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, [FromBody] CarUpdateDto dto)
    {
        dto. = id;
        return Ok(await _carService.UpdateCarAsync(id, dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(int id) => Ok(await _carService.DeleteCarAsync(id));
}