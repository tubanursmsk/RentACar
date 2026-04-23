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

    
    [HttpPost]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Create([FromBody] CarCreateDto dto) => Ok(await _carService.CreateCarAsync(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")] // Yönergeye göre personel yetkisi
    public async Task<IActionResult> Update(int id, [FromBody] CarUpdateDto carUpdateDto)
    {
        // 1. Güvenlik Kontrolü: URL ID'si ile Body ID'si aynı mı?
        if (id != carUpdateDto.Id)
        {
            return BadRequest(ApiResponse<object>.ErrorResult("URL'deki ID ile gönderilen nesnenin ID'si uyuşmuyor."));
        }

        // 2. Servis Çağrısı
        var result = await _carService.UpdateCarAsync(carUpdateDto);

        if (!result.Success)
        {
            return NotFound(result);
        }

        // 3. Başarılı Yanıt (Yönergeye uygun boş nesne ile)
        return Ok(ApiResponse<object>.SuccessResult(new { }, "Araç bilgileri başarıyla güncellendi."));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> Delete(int id) => Ok(await _carService.DeleteCarAsync(id));
}