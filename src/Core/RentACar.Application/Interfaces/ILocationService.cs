using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Responses;
using RentACar.Domain.Models;

namespace RentACar.Application.Interfaces;

public interface ILocationService
{
    Task<ApiResponse<PaginationModel<LocationDto>>> GetPagedLocationsAsync(int pageNumber, int pageSize);
    Task<ApiResponse<IEnumerable<LocationDto>>> GetAllLocationsAsync();
    Task<ApiResponse<LocationDto>> GetLocationByIdAsync(int id);
    Task<ApiResponse<int>> CreateLocationAsync(LocationCreateDto dto);
    Task<ApiResponse<bool>> UpdateLocationAsync(int id, LocationUpdateDto dto);
    Task<ApiResponse<bool>> DeleteLocationAsync(int id);
}