using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.DTOs.User;
using RentACar.Application.Helpers;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;
using RentACar.Domain.Models;

namespace RentACar.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    public async Task<ApiResponse<PaginationModel<UserDto>>> GetPagedUsersAsync(int pageNumber, int pageSize)
    {
        var pagedUsers = await _unitOfWork.Repository<User>().GetPagedAsync(pageNumber, pageSize, u => !u.IsDeleted);
        
        // Entity listesini DTO listesine çeviriyoruz
        var dtos = _mapper.Map<List<UserDto>>(pagedUsers.Items);

        var result = new PaginationModel<UserDto>
        {
            Items = dtos,
            TotalCount = pagedUsers.TotalCount
        };

        return ApiResponse<PaginationModel<UserDto>>.SuccessResult(result);
    }

    public async Task<ApiResponse<IEnumerable<UserDto>>> GetAllUsersAsync()
    {
        var users = await _unitOfWork.Repository<User>().GetAllAsync();
        var dtos = _mapper.Map<IEnumerable<UserDto>>(users);
        return ApiResponse<IEnumerable<UserDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<IEnumerable<UserDto>>?> GetCompanyStaffAsync(int companyId)
    {
        var staff = await _unitOfWork.Repository<User>().GetWhere(u => u.CompanyId == companyId && !u.IsDeleted).ToListAsync();
        var dtos = _mapper.Map<IEnumerable<UserDto>>(staff);
        return ApiResponse<IEnumerable<UserDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(int id)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
        if (user == null) return ApiResponse<UserDto>.ErrorResult("Kullanıcı bulunamadı.");

        return ApiResponse<UserDto>.SuccessResult(_mapper.Map<UserDto>(user));
    }

    public async Task<ApiResponse<bool>> UpdateProfileAsync(int userId, UserUpdateDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return ApiResponse<bool>.ErrorResult("Kullanıcı bulunamadı.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Profil güncellendi.");
    }

    public async Task<ApiResponse<bool>> AssignRoleAsync(UserDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(dto.Id);
        if (user == null) return ApiResponse<bool>.ErrorResult("Kullanıcı bulunamadı.");

        user.Role = dto.Role;
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Rol atandı.");
    }

    public async Task<ApiResponse<bool>> RemoveRoleAsync(UserDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(dto.Id);
        if (user == null) return ApiResponse<bool>.ErrorResult("Kullanıcı bulunamadı.");

        user.Role = "Customer"; // Varsayılana çek
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Rol sıfırlandı.");
    }

    public async Task<ApiResponse<bool>> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (user == null) return ApiResponse<bool>.ErrorResult("Kullanıcı bulunamadı.");

        if (!PasswordHasher.VerifyPassword(currentPassword, user.PasswordHash))
            return ApiResponse<bool>.ErrorResult("Mevcut şifre hatalı.");

        user.PasswordHash = PasswordHasher.HashPassword(newPassword);
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResult(true, "Şifre değiştirildi.");
    }
}