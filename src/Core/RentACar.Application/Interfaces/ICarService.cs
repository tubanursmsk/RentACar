using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface ICarService
{
    // YENİ EKLENEN FİLTRE PARAMETRELERİ
    Task<ApiResponse<PaginatedResult<CarDto>>> GetPagedAsync(
        int pageNumber, int pageSize, 
        int? locationId = null, int? fuelType = null, int? transmissionType = null, 
        decimal? minPrice = null, decimal? maxPrice = null, string? searchTerm = null, List<int>? brandIds = null);
        
    Task<ApiResponse<IEnumerable<CarDto>>> GetAllAsync();
    Task<ApiResponse<CarDto>> GetByIdAsync(int id);
    Task<ApiResponse<int>> CreateAsync(CarCreateDto dto);
    Task<ApiResponse<bool>> UpdateAsync(int id, CarUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}