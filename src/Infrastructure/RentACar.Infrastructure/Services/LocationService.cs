using AutoMapper;
using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;
using RentACar.Domain.Models;

namespace RentACar.Infrastructure.Services;

public class LocationService : ILocationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public LocationService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginationModel<LocationDto>>> GetPagedLocationsAsync(int pageNumber, int pageSize)
    {
        var pagedData = await _unitOfWork.Repository<Location>().GetPagedAsync(pageNumber, pageSize, b => !b.IsDeleted);
        var dtos = _mapper.Map<List<LocationDto>>(pagedData.Items);
        return ApiResponse<PaginationModel<LocationDto>>.SuccessResult(new PaginationModel<LocationDto> { Items = dtos, TotalCount = pagedData.TotalCount });
    }

    public async Task<ApiResponse<IEnumerable<LocationDto>>> GetAllLocationsAsync()
    {
        var Locations = await _unitOfWork.Repository<Location>().GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<LocationDto>>(Locations.Where(b => !b.IsDeleted));
        return ApiResponse<IEnumerable<LocationDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<LocationDto>> GetLocationByIdAsync(int id)
    {
        var Location = await _unitOfWork.Repository<Location>().GetByIdAsync(id);
        if (Location == null || Location.IsDeleted) return ApiResponse<LocationDto>.ErrorResult("Konum bulunamadı.");
        return ApiResponse<LocationDto>.SuccessResult(_mapper.Map<LocationDto>(Location));
    }

    public async Task<ApiResponse<int>> CreateLocationAsync(LocationCreateDto dto)
    {
        var Location = _mapper.Map<Location>(dto);
        await _unitOfWork.Repository<Location>().AddAsync(Location);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<int>.SuccessResult(Location.Id, "Konum başarıyla eklendi.");
    }

    public async Task<ApiResponse<bool>> UpdateLocationAsync(int id, LocationUpdateDto dto)
    {
        var Location = await _unitOfWork.Repository<Location>().GetByIdAsync(id);
        if (Location == null || Location.IsDeleted) return ApiResponse<bool>.ErrorResult("Konum bulunamadı.");

        _mapper.Map(dto, Location);
        Location.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<Location>().Update(Location);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Konum başarıyla güncellendi.");
    }

    public async Task<ApiResponse<bool>> DeleteLocationAsync(int id)
    {
        var Location = await _unitOfWork.Repository<Location>().GetByIdAsync(id);
        if (Location == null || Location.IsDeleted) return ApiResponse<bool>.ErrorResult("Konum bulunamadı.");

        // Soft delete (Veritabanından silmek yerine bayrak işaretliyoruz)
        Location.IsDeleted = true;
        Location.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<Location>().Update(Location);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Konum başarıyla silindi.");
    }
}