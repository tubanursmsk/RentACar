using RentACar.Application.DTOs.Payment;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IPaymentService
{
    /// <summary>
    /// 3DS ödeme akışını başlatır. Iyzico'ya kart bilgilerini gönderir,
    /// dönen HTML content'ini frontend'e aktarır.
    /// </summary>
    Task<ApiResponse<PaymentInitResponseDto>> InitThreeDSPaymentAsync(int currentUserId, InitPaymentDto dto);

    /// <summary>
    /// 3DS callback — Iyzico ödeme sonucunu bildirir.
    /// Payment kaydını günceller, başarılıysa Rental'ı Approved yapar.
    /// </summary>
    /// <returns>Kullanıcının yönlendirileceği rentalId</returns>
    Task<ApiResponse<int>> ProcessThreeDSCallbackAsync(ThreeDSCallbackDto dto);
}
