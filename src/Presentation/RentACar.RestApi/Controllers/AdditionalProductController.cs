using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AdditionalProductController : ControllerBase
{
    private readonly IAdditionalProductService _service;

    public AdditionalProductController(IAdditionalProductService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
