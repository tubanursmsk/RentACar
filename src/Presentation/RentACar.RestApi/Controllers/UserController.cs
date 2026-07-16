using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.Interfaces;
using RentACar.Application.DTOs.User;
using System.Security.Claims;

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

    // ⭐ YENİ: Kullanıcı kendi profilini günceller (JWT'den userId alır)
    [HttpPut("UpdateProfile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDto dto)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        dto.Id = currentUserId;
        var result = await _userService.UpdateProfileAsync(currentUserId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // Admin — herhangi bir kullanıcının profilini günceller
    [HttpPut("UpdateProfile/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProfileByAdmin(int userId, [FromBody] UserUpdateDto dto)
    {
        dto.Id = userId;
        var result = await _userService.UpdateProfileAsync(userId, dto);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ⭐ YENİ: Şifre değiştirme
    [HttpPut("ChangePassword")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _userService.ChangePasswordAsync(
            currentUserId,
            dto.CurrentPassword,
            dto.NewPassword);

        return result.Success ? Ok(result) : BadRequest(result);
    }

    // Admin panelden manuel kullanıcı ekleme
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