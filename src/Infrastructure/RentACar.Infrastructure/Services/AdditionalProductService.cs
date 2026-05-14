using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.AdditionalProducts;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class AdditionalProductService : IAdditionalProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public AdditionalProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<List<AdditionalProductDto>>> GetAllAsync()
    {
        var products = await _unitOfWork.Repository<AdditionalProduct>()
            .GetWhere(p => !p.IsDeleted)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();

        var dtos = products.Select(p => new AdditionalProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Code = p.Code,
            Description = p.Description,
            DailyPrice = p.DailyPrice,
            IconName = p.IconName,
            IsQuantityBased = p.IsQuantityBased,
            MaxQuantity = p.MaxQuantity,
            DisplayOrder = p.DisplayOrder
        }).ToList();

        return ApiResponse<List<AdditionalProductDto>>.SuccessResult(dtos);
    }
}