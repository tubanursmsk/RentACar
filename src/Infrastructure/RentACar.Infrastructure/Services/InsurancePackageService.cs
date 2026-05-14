using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Insurance;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class InsurancePackageService : IInsurancePackageService
{
    private readonly IUnitOfWork _unitOfWork;

    public InsurancePackageService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<InsurancePackageDto>>> GetAllAsync()
    {
        var packages = await _unitOfWork.Repository<InsurancePackage>()
            .GetWhere(p => !p.IsDeleted)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();

        var dtos = packages.Select(MapToDto).ToList();
        return ApiResponse<List<InsurancePackageDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<InsurancePackageDto>> GetByIdAsync(int id)
    {
        var package = await _unitOfWork.Repository<InsurancePackage>().GetByIdAsync(id);
        if (package == null || package.IsDeleted)
            return ApiResponse<InsurancePackageDto>.ErrorResult("Paket bulunamadı.");

        return ApiResponse<InsurancePackageDto>.SuccessResult(MapToDto(package));
    }

    private static InsurancePackageDto MapToDto(InsurancePackage p)
    {
        var features = new List<InsuranceFeatureDto>();
        try
        {
            features = JsonSerializer.Deserialize<List<InsuranceFeatureDto>>(p.FeaturesJson) ?? new();
        }
        catch { /* boş bırak */ }

        return new InsurancePackageDto
        {
            Id = p.Id,
            Name = p.Name,
            Code = p.Code,
            DailyPrice = p.DailyPrice,
            Description = p.Description,
            DisplayOrder = p.DisplayOrder,
            IsRecommended = p.IsRecommended,
            Features = features
        };
    }
}
