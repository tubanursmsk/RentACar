using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface IRentalService
{
    // --- MÜŞTERİ (CUSTOMER) İŞLEMLERİ ---
    Task<ApiResponse<int>> CreateRentalAsync(int currentUserId, RentalCreateDto dto);
    Task<ApiResponse<IEnumerable<RentalDto>>> GetMyRentalsAsync(int userId);

    // --- ADMİN / PERSONEL İŞLEMLERİ ---
    
    // Admin'in müşteri seçerek kiralama yapması
    Task<ApiResponse<int>> AdminCreateRentalAsync(RentalCreateDto dto); 
    
    // Tüm kiralamaları sayfalamalı listeleme
    Task<ApiResponse<PaginatedResult<RentalDto>>> GetPagedRentalsAsync(int pageNumber, int pageSize);
    
    // Kiralama detayını getirme
    Task<ApiResponse<RentalDto>> GetRentalByIdAsync(int id);
    
    // Durum güncellemeleri (State Machine)
    Task<ApiResponse<bool>> ApproveRentalAsync(int rentalId); 
    Task<ApiResponse<bool>> CompleteRentalAsync(int rentalId); 
    Task<ApiResponse<bool>> CancelRentalAsync(int rentalId); // İptal etme
    
    // Kiralamayı veritabanından silme (Soft veya Hard delete)
    Task<ApiResponse<bool>> DeleteRentalAsync(int id); 
}