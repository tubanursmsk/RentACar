using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Customer; // Dto için gerekli
using RentACar.Application.Interfaces;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    // GET: api/Customer/All
    [HttpGet("All")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")] 
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _customerService.GetAllCustomersAsync());
    }

    // GET: api/Customer/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")]
    public async Task<IActionResult> GetById(int id)
    {
        return Ok(await _customerService.GetCustomerByIdAsync(id));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,CompanyManager,Staff")] 
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _customerService.DeleteAsync(id);
        if (result.Success) return Ok(result);
        return BadRequest(result);
    }
}