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

    // GET api/Car/Paged?pageNumber=1&pageSize=10  ← Sayfalanmış liste
    [HttpGet("Paged")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _carService.GetPagedAsync(pageNumber, pageSize);
        return Ok(result);
    }

    // GET api/Car/All  ← Tümünü çek (dropdown vs.)
    [HttpGet("All")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _carService.GetAllAsync();
        return Ok(result);
    }

    // GET api/Car/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _carService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    // POST api/Car  ← Multipart form-data ile alır
    [HttpPost]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] CarCreateDto dto)
    {
        var result = await _carService.CreateAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // PUT api/Car/{id}  ← Multipart form-data ile alır
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

    // DELETE api/Car/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _carService.DeleteAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}