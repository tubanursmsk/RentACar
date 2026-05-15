using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarController : ControllerBase
{
    private readonly ICarService _carService;

    public CarController(ICarService carService)
    {
        _carService = carService;
    }

    // YENİ EKLENEN FİLTRE PARAMETRELERİ
    [HttpGet("Paged")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] int? locationId = null,
        [FromQuery] int? fuelType = null,
        [FromQuery] int? transmissionType = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] List<int>? brandIds = null)
    {
        var result = await _carService.GetPagedAsync(pageNumber, pageSize, locationId, fuelType, transmissionType, minPrice, maxPrice, searchTerm, brandIds);
        return Ok(result);
    }

    [HttpGet("All")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _carService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _carService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] CarCreateDto dto)
    {
        var result = await _carService.CreateAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(int id, [FromForm] CarUpdateDto dto)
    {
        if (id != dto.Id)
            return BadRequest(ApiResponse<object>.ErrorResult("URL'deki ID ile gönderilen nesnenin ID'si uyuşmuyor."));

        var result = await _carService.UpdateAsync(id, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _carService.DeleteAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}