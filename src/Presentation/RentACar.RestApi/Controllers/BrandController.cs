using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController : ControllerBase
{
    private readonly IBrandService _brandService;
    public BrandController(IBrandService brandService) => _brandService = brandService;

    [HttpGet("Paged")]
    public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10) 
        => Ok(await _brandService.GetPagedBrandsAsync(pageNumber, pageSize));

    [HttpGet("All")]
    public async Task<IActionResult> GetAll() => Ok(await _brandService.GetAllBrandsAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id) => Ok(await _brandService.GetBrandByIdAsync(id));

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")] // Sadece yetkili personel
    public async Task<IActionResult> Create(BrandCreateDto dto) => Ok(await _brandService.CreateBrandAsync(dto));

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Update(int id, BrandUpdateDto dto)
    {
        dto.Id = id; // Güvenlik için URL'den gelen ID'yi DTO'ya basıyoruz
        return Ok(await _brandService.UpdateBrandAsync(id, dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(int id) => Ok(await _brandService.DeleteBrandAsync(id));
}