using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface ICarService
{
    Task<ApiResponse<IEnumerable<CarDto>>> GetAllAsync();
    Task<ApiResponse<CarDto>> GetByIdAsync(int id);
    Task<ApiResponse<int>> CreateAsync(CarCreateDto dto);
    Task<ApiResponse<bool>> UpdateAsync(int id, CarUpdateDto dto);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}