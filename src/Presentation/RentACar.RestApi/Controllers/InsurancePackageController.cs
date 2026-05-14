using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]    // Liste public (rezervasyon akışında login öncesi de görülebilmeli)
public class InsurancePackageController : ControllerBase
{
    private readonly IInsurancePackageService _service;

    public InsurancePackageController(IInsurancePackageService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
