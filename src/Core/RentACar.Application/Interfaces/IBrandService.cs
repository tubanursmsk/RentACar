using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Responses;
using RentACar.Domain.Models;

namespace RentACar.Application.Interfaces;

public interface IBrandService
{
    Task<ApiResponse<PaginationModel<BrandDto>>> GetPagedBrandsAsync(int pageNumber, int pageSize);
    Task<ApiResponse<IEnumerable<BrandDto>>> GetAllBrandsAsync();
    Task<ApiResponse<BrandDto>> GetBrandByIdAsync(int id);
    Task<ApiResponse<int>> CreateBrandAsync(BrandCreateDto dto);
    Task<ApiResponse<bool>> UpdateBrandAsync(int id, BrandUpdateDto dto);
    Task<ApiResponse<bool>> DeleteBrandAsync(int id);
}