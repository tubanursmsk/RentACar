using AutoMapper;
using RentACar.Application.DTOs.AdditionalService;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class AdditionalServiceService : IAdditionalServiceService 
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AdditionalServiceService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<IEnumerable<AdditionalServiceDto>>> GetAllAsync()
    {
        // Sadece silinmemiş olan ek hizmetleri getiriyoruz
        var services = await _unitOfWork.Repository<AdditionalService>().GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<AdditionalServiceDto>>(services.Where(s => !s.IsDeleted));
        
        return ApiResponse<IEnumerable<AdditionalServiceDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<int>> CreateAsync(AdditionalServiceCreateDto dto)
    {
        var service = _mapper.Map<AdditionalService>(dto);
        
        await _unitOfWork.Repository<AdditionalService>().AddAsync(service);
        await _unitOfWork.SaveChangesAsync();
        
        return ApiResponse<int>.SuccessResult(service.Id, "Ek hizmet başarıyla oluşturuldu.");
    }

    public async Task<ApiResponse<bool>> UpdateAsync(AdditionalServiceUpdateDto dto)
    {
        var service = await _unitOfWork.Repository<AdditionalService>().GetByIdAsync(dto.Id);
        
        if (service == null || service.IsDeleted) 
            return ApiResponse<bool>.ErrorResult("Güncellenmek istenen ek hizmet bulunamadı.");

        // DTO'dan gelen yeni verileri mevcut entity'nin üzerine yazıyoruz
        _mapper.Map(dto, service);
        service.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<AdditionalService>().Update(service);
        await _unitOfWork.SaveChangesAsync();
        
        return ApiResponse<bool>.SuccessResult(true, "Ek hizmet başarıyla güncellendi.");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var service = await _unitOfWork.Repository<AdditionalService>().GetByIdAsync(id);
        
        if (service == null || service.IsDeleted) 
            return ApiResponse<bool>.ErrorResult("Silinmek istenen ek hizmet bulunamadı.");

        // Veritabanından tamamen uçurmak yerine Soft Delete (Durumunu silindi yapma) uyguluyoruz
        service.IsDeleted = true;
        service.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<AdditionalService>().Update(service);
        await _unitOfWork.SaveChangesAsync();
        
        return ApiResponse<bool>.SuccessResult(true, "Ek hizmet sistemden kaldırıldı.");
    }
}