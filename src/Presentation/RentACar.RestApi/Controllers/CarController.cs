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

    [HttpGet("Paged")]
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

    [HttpPost("Create")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Create([FromForm] CarCreateDto dto)
    {
        var result = await _carService.CreateAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("Update/{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Update(int id, [FromForm] CarUpdateDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResult("URL'deki ID ile gönderilen nesnenin ID'si uyuşmuyor."));
        }

        var result = await _carService.UpdateAsync(id, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("Delete/{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _carService.DeleteAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}