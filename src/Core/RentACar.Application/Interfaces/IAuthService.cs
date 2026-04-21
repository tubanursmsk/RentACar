using RentACar.Application.DTOs.Auth;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IAuthService 
{
    Task<ApiResponse<string>> LoginAsync(LoginDto dto);
    Task<ApiResponse<int>> RegisterWithCompanyAsync(RegisterCompanyDto dto);
    Task<ApiResponse<int>> RegisterForCompanyAsync(RegisterDto dto, int companyId);
    Task<ApiResponse<bool>> ChangePasswordAsync(ChangePasswordDto dto);
    Task<ApiResponse<int>> RegisterCustomerAsync(RegisterDto dto);
}