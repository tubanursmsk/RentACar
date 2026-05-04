using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;
using RentACar.Application.DTOs.User;

namespace RentACar.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    public UserController(IUserService userService) => _userService = userService;

    [HttpGet("Paged")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPagedUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10) 
        => Ok(await _userService.GetPagedUsersAsync(pageNumber, pageSize));

    [HttpGet("All")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers() => Ok(await _userService.GetAllUsersAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id) => Ok(await _userService.GetUserByIdAsync(id));

    [HttpPost("AssignRole")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignRole(UserDto dto) => Ok(await _userService.AssignRoleAsync(dto));

    [HttpPut("UpdateProfile/{userId}")]
    public async Task<IActionResult> UpdateProfile(int userId, UserUpdateDto dto)
    {
        dto.Id = userId;
        return Ok(await _userService.UpdateProfileAsync(userId, dto));
    }
    
    // admin panelden personelin manuel olarak müşteri eklenmesi için oluşturulan metod
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] UserCreateDto dto)
    {
        var result = await _userService.CreateUserAsync(dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _userService.DeleteUserAsync(id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}