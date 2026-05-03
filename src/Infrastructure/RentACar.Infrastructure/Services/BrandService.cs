using AutoMapper;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;
using RentACar.Domain.Models;

namespace RentACar.Infrastructure.Services;

public class BrandService : IBrandService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BrandService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<PaginationModel<BrandDto>>> GetPagedBrandsAsync(int pageNumber, int pageSize)
    {
        var pagedData = await _unitOfWork.Repository<Brand>().GetPagedAsync(pageNumber, pageSize, b => !b.IsDeleted);
        var dtos = _mapper.Map<List<BrandDto>>(pagedData.Items);
        return ApiResponse<PaginationModel<BrandDto>>.SuccessResult(new PaginationModel<BrandDto> { Items = dtos, TotalCount = pagedData.TotalCount });
    }

    public async Task<ApiResponse<IEnumerable<BrandDto>>> GetAllBrandsAsync()
    {
        var brands = await _unitOfWork.Repository<Brand>().GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<BrandDto>>(brands.Where(b => !b.IsDeleted));
        return ApiResponse<IEnumerable<BrandDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<BrandDto>> GetBrandByIdAsync(int id)
    {
        var brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(id);
        if (brand == null || brand.IsDeleted) return ApiResponse<BrandDto>.ErrorResult("Marka bulunamadı.");
        return ApiResponse<BrandDto>.SuccessResult(_mapper.Map<BrandDto>(brand));
    }

    public async Task<ApiResponse<int>> CreateBrandAsync(BrandCreateDto dto)
    {
        var brand = _mapper.Map<Brand>(dto);

        // --- LOGO KAYDETME BLOĞU ---
        if (dto.LogoFile != null && dto.LogoFile.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "brands");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.LogoFile.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.LogoFile.CopyToAsync(fileStream);
            }
            brand.LogoUrl = "/images/brands/" + uniqueFileName;
        }

        await _unitOfWork.Repository<Brand>().AddAsync(brand);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<int>.SuccessResult(brand.Id, "Marka eklendi.");
    }

    public async Task<ApiResponse<bool>> UpdateBrandAsync(int id, BrandUpdateDto dto)
    {
        var brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(id);
        if (brand == null || brand.IsDeleted) return ApiResponse<bool>.ErrorResult("Marka bulunamadı.");

        // Eski logoyu yedekle
        var oldLogoUrl = brand.LogoUrl;

        _mapper.Map(dto, brand);

        // --- LOGO GÜNCELLEME BLOĞU ---
        if (dto.LogoFile != null && dto.LogoFile.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "brands");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.LogoFile.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.LogoFile.CopyToAsync(fileStream);
            }
            brand.LogoUrl = "/images/brands/" + uniqueFileName;
        }
        else
        {
            brand.LogoUrl = oldLogoUrl; // Yeni resim yoksa eskiyi koru
        }

        brand.UpdatedDate = DateTime.UtcNow;
        _unitOfWork.Repository<Brand>().Update(brand);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Marka güncellendi.");
    }

    public async Task<ApiResponse<bool>> DeleteBrandAsync(int id)
    {
        var brand = await _unitOfWork.Repository<Brand>().GetByIdAsync(id);
        if (brand == null || brand.IsDeleted) return ApiResponse<bool>.ErrorResult("Marka bulunamadı.");

        // Soft delete (Veritabanından silmek yerine bayrak işaretliyoruz)
        brand.IsDeleted = true;
        brand.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<Brand>().Update(brand);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Marka başarıyla silindi.");
    }
}