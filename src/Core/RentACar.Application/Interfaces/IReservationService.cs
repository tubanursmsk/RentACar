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
    
    // ═══════════════════════════════════════════════════
    // ▼▼▼ YENİ: REZERVASYON YÖNETİMİ ▼▼▼
    // ═══════════════════════════════════════════════════
 
    /// <summary>
    /// Kullanıcının kendi rezervasyonlarını listeler.
    /// Filter: "active" | "past" | "cancelled" | null (tümü)
    /// </summary>
    Task<ApiResponse<List<MyReservationDto>>> GetMyReservationsAsync(int currentUserId, string? filter = null);
 
    /// <summary>
    /// Rezervasyonu iptal eder. İş kuralı: Alışa 24 saatten az kaldıysa iptal edilemez.
    /// Yetki: Yalnızca rezervasyon sahibi.
    /// </summary>
    Task<ApiResponse<bool>> CancelMyReservationAsync(int reservationId, int currentUserId, CancelReservationDto dto);
 
    /// <summary>
    /// Rezervasyonun tarihlerini günceller.
    /// İş kuralı: Alışa 24 saatten az kaldıysa güncellenemez.
    /// Fiyat yeniden hesaplanır. Aracın müsaitlik kontrolü yapılır.
    /// </summary>
    Task<ApiResponse<bool>> UpdateMyReservationDatesAsync(int reservationId, int currentUserId, UpdateReservationDatesDto dto);
}
 
