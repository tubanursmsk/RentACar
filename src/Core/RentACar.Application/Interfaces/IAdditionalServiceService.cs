using RentACar.Application.DTOs.AdditionalService;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IAdditionalServiceService
{
    Task<ApiResponse<IEnumerable<AdditionalServiceDto>>> GetAllAsync();
    Task<ApiResponse<int>> CreateAsync(AdditionalServiceCreateDto dto);
    Task<ApiResponse<bool>> UpdateAsync(AdditionalServiceUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}