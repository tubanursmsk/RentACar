using RentACar.Application.DTOs.AdditionalProducts;
using RentACar.Application.DTOs.Insurance;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IInsurancePackageService
{
    Task<ApiResponse<List<InsurancePackageDto>>> GetAllAsync();
    Task<ApiResponse<InsurancePackageDto>> GetByIdAsync(int id);
}

public interface IAdditionalProductService
{
    Task<ApiResponse<List<AdditionalProductDto>>> GetAllAsync();
}

public interface IReservationService
{
    Task<ApiResponse<PricePreviewDto>> CalculatePricePreviewAsync(PricePreviewRequestDto request);
    Task<ApiResponse<int>> CreateReservationAsync(int currentUserId, CreateReservationDto dto);
    Task<ApiResponse<ReservationDetailDto>> GetReservationDetailAsync(int reservationId, int currentUserId);
}