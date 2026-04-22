using RentACar.Application.DTOs.Responses;
using RentACar.Application.DTOs.User;
using RentACar.Domain.Models;

namespace RentACar.Application.Interfaces;

public interface IUserService
{
    Task<ApiResponse<PaginationModel<UserDto>>> GetPagedUsersAsync(int pageNumber, int pageSize);
    Task<ApiResponse<IEnumerable<UserDto>>> GetAllUsersAsync();
    Task<ApiResponse<IEnumerable<UserDto>>?> GetCompanyStaffAsync(int companyId);
    Task<ApiResponse<UserDto>> GetUserByIdAsync(int id);
    Task<ApiResponse<bool>> UpdateProfileAsync(int userId, UserUpdateDto dto);
    Task<ApiResponse<bool>> AssignRoleAsync(UserDto dto);
    Task<ApiResponse<bool>> RemoveRoleAsync(UserDto dto);
    Task<ApiResponse<bool>> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
}