using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IRentalService
{
    Task<ApiResponse<int>> CreateRentalAsync(int currentUserId, RentalCreateDto dto);
    Task<ApiResponse<bool>> ApproveRentalAsync(int rentalId); // State Machine
    Task<ApiResponse<bool>> CompleteRentalAsync(int rentalId); // State Machine
    Task<ApiResponse<IEnumerable<RentalDto>>> GetMyRentalsAsync(int userId);
}