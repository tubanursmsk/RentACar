using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Auth;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Helpers;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AuthService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<string>> LoginAsync(LoginDto dto)
    {
        var user = (await _unitOfWork.Repository<User>().GetWhere(u => u.Email == dto.Email).ToListAsync()).FirstOrDefault();

        if (user == null || !PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            return ApiResponse<string>.ErrorResult("E-posta veya şifre hatalı.");

        string fullName = $"{user.FirstName} {user.LastName}";

        var token = JwtTokenHelper.GenerateToken(
            user.Id,
            user.Email,
            fullName, 
            user.CompanyId ?? 0,
            new List<string> { user.Role }
        );

        return ApiResponse<string>.SuccessResult(token, "Giriş başarılı.");
    }

    public async Task<ApiResponse<int>> RegisterWithCompanyAsync(RegisterCompanyDto dto)
    {
        if (await _unitOfWork.Repository<User>().AnyAsync(u => u.Email == dto.Email))
            return ApiResponse<int>.ErrorResult("Email zaten kayıtlı.");

        var newCompany = new Company
        {
            Name = dto.CompanyName,
            Phone = dto.Phone,
            TaxNumber = dto.TaxNumber,
            City = dto.City,
            District = dto.District,
            FullAddress = dto.FullAddress
        };
        await _unitOfWork.Repository<Company>().AddAsync(newCompany);
        await _unitOfWork.SaveChangesAsync(); // ID oluşması için önce şirketi kaydediyoruz

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = PasswordHasher.HashPassword(dto.Password),
            Role = "Staff",
            CompanyId = newCompany.Id 
        };

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(user.Id, "Şirket ve yönetici kaydı başarılı.");
    }

   public async Task<ApiResponse<int>> RegisterCustomerAsync(RegisterDto dto)
{
    // 1. Email kontrolü
    if (await _unitOfWork.Repository<User>().AnyAsync(u => u.Email == dto.Email))
        return ApiResponse<int>.ErrorResult("Email zaten kayıtlı.");

    // 2. User nesnesini oluştur (Burada Phone alanını entity'e aktarmayı unutma)
    var user = new User
    {
        FirstName = dto.FirstName,
        LastName = dto.LastName,
        Email = dto.Email,
        Phone = dto.Phone, // DTO'da Phone alanı olduğundan emin ol
        PasswordHash = PasswordHasher.HashPassword(dto.Password),
        Role = "Customer",
        CompanyId = null,
        FullAddress = "" // Varsa DTO'dan al, yoksa boş geç
    };

    await _unitOfWork.Repository<User>().AddAsync(user);
    await _unitOfWork.SaveChangesAsync(); // User ID'sinin oluşması için kaydediyoruz

    // 3. KRİTİK ADIM: Customer tablosuna kayıt oluştur
    var customer = new Customer
    {
        UserId = user.Id, 
        IdentityNumber = "", 
        Phone = dto.Phone, 
        DateOfBirth = DateTime.Now.AddYears(-18), 
        FindeksScore = 0 // Başlangıç puanı
    };
    

    await _unitOfWork.Repository<Customer>().AddAsync(customer);
    await _unitOfWork.SaveChangesAsync();

    return ApiResponse<int>.SuccessResult(user.Id, "Müşteri kaydı başarıyla oluşturuldu.");
}
    public async Task<ApiResponse<bool>> ChangePasswordAsync(ChangePasswordDto dto)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(dto.UserId);
        if (user == null) return ApiResponse<bool>.ErrorResult("Kullanıcı bulunamadı.");

        if (!PasswordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            return ApiResponse<bool>.ErrorResult("Mevcut şifreniz hatalı.");

        user.PasswordHash = PasswordHasher.HashPassword(dto.NewPassword);
        user.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Şifreniz başarıyla güncellendi.");
    }

    public async Task<ApiResponse<int>> RegisterForCompanyAsync(RegisterDto dto, int companyId)
    {
        if (await _unitOfWork.Repository<User>().AnyAsync(u => u.Email == dto.Email))
            return ApiResponse<int>.ErrorResult("Email zaten kayıtlı.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = PasswordHasher.HashPassword(dto.Password),
            Role = "Staff",
            CompanyId = companyId
        };

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<int>.SuccessResult(user.Id, "Şirket personeli kaydı başarılı.");
    }
}