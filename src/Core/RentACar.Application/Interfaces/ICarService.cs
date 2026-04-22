using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface ICarService
{
    // Standart CRUD
    Task<ApiResponse<PaginatedResult<CarDto>>> GetPagedCarsAsync(int pageNumber, int pageSize);
    Task<ApiResponse<CarDto>> GetCarByIdAsync(int id);
    Task<ApiResponse<int>> CreateCarAsync(CarCreateDto dto);
    Task<ApiResponse<bool>> UpdateCarAsync(int id, CarUpdateDto dto);
    Task<ApiResponse<bool>> DeleteCarAsync(int id);

    //Gelişmiş Müsaitlik Arama Algoritması
    Task<ApiResponse<PaginatedResult<CarDto>>> GetAvailableCarsAsync(AvailableCarSearchDto searchDto);
}