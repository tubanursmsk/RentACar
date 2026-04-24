using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Dashboard;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

// Interface'i IDeshboardService olarak oluşturmayı unutma
public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<DashboardStatsDto>> GetStatsAsync()
    {
        var stats = new DashboardStatsDto
        {
            // Toplam sistemdeki silinmemiş araç sayısı
            TotalCars = await _unitOfWork.Repository<Car>()
                .GetWhere(c => !c.IsDeleted).CountAsync(),

            // Şu an statüsü "Kirada" (2) olan araçlar
            ActiveRentedCars = await _unitOfWork.Repository<Car>()
                .GetWhere(c => !c.IsDeleted && c.Status == CarStatus.Rented).CountAsync(),

            // Statüsü "Pending" (Beklemede - 1) olan rezervasyon talepleri
            PendingReservations = await _unitOfWork.Repository<Rental>()
                .GetWhere(r => !r.IsDeleted && r.Status == ReservationStatus.Pending).CountAsync(),

            // Sistemdeki kayıtlı müşteriler
            TotalCustomers = await _unitOfWork.Repository<Customer>()
                .GetWhere(c => !c.IsDeleted).CountAsync()
        };

        return ApiResponse<DashboardStatsDto>.SuccessResult(stats, "İstatistikler başarıyla yüklendi.");
    }
}