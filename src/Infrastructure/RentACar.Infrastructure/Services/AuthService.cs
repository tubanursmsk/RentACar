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
    private readonly IJwtTokenHelper _jwtTokenHelper;
    private readonly IIdentityValidationService _identityService;
    private readonly IFindeksService _findeksService;
    private readonly IEmailService _emailService;   // ⭐ YENİ

    public AuthService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IJwtTokenHelper jwtTokenHelper,
        IIdentityValidationService identityService,
        IFindeksService findeksService,
        IEmailService emailService)   // ⭐ YENİ parametre
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _jwtTokenHelper = jwtTokenHelper;
        _identityService = identityService;
        _findeksService = findeksService;
        _emailService = emailService;   // ⭐ YENİ
    }

    public async Task<ApiResponse<string>> LoginAsync(LoginDto dto)
    {
        var user = (await _unitOfWork.Repository<User>().GetWhere(u => u.Email == dto.Email).ToListAsync()).FirstOrDefault();

        if (user == null || !PasswordHasher.VerifyPassword(dto.Password, user.PasswordHash))
            return ApiResponse<string>.ErrorResult("E-posta veya şifre hatalı.");

        string fullName = $"{user.FirstName} {user.LastName}";

        var token = _jwtTokenHelper.GenerateToken(
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
        await _unitOfWork.SaveChangesAsync();

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

    public async Task<ApiResponse<int>> RegisterCustomerAsync(RegisterCustomerDto dto)
    {
        // 1. Email kontrolü
        if (await _unitOfWork.Repository<User>().AnyAsync(u => u.Email == dto.Email))
            return ApiResponse<int>.ErrorResult("Bu e-posta adresi sistemde zaten kayıtlı.");

        // 2. GERÇEK MERNİS TC KİMLİK DOĞRULAMA (Devlet Sunucusuna Bağlanıyor)
        bool isIdentityValid = await _identityService.ValidateTcKimlikNoAsync(dto.IdentityNumber, dto.FirstName, dto.LastName, dto.DateOfBirth.Year);

        if (!isIdentityValid)
            return ApiResponse<int>.ErrorResult("MERNİS doğrulaması başarısız! Lütfen TC Kimlik No, Ad, Soyad ve Doğum Yılı bilgilerinizi kimliğinizdeki gibi eksiksiz giriniz.");

        // 3. User nesnesini oluştur
        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            PasswordHash = PasswordHasher.HashPassword(dto.Password),
            Role = "Customer",
            CompanyId = null,
            FullAddress = ""
        };

        await _unitOfWork.Repository<User>().AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        // 4. KKB FINDEKS SORGULAMA SİMÜLASYONU
        int findeksScore = await _findeksService.GetFindeksScoreAsync(dto.IdentityNumber);

        // 5. Customer tablosuna kayıt oluştur
        var customer = new Customer
        {
            UserId = user.Id,
            IdentityNumber = dto.IdentityNumber,
            Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth,
            FindeksScore = findeksScore
        };

        await _unitOfWork.Repository<Customer>().AddAsync(customer);
        await _unitOfWork.SaveChangesAsync();

        // 6. ⭐ YENİ: Hoş geldin maili gönder (fire-and-forget)
        // Kullanıcı akışını geciktirmemesi için await kullanmıyoruz
        _ = SendWelcomeEmailSafeAsync(user.Id);

        return ApiResponse<int>.SuccessResult(user.Id, "Müşteri kaydı başarıyla oluşturuldu ve Findeks puanı hesaplandı.");
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

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: EMAIL GÖNDERİM HELPER'I
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Hoş geldin mailini fire-and-forget ile gönderir.
    /// Email hatası kayıt işlemini etkilemez.
    /// </summary>
    private async Task SendWelcomeEmailSafeAsync(int userId)
    {
        try
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user != null)
                await _emailService.SendWelcomeEmailAsync(user);
        }
        catch
        {
            // Email hatası zaten EmailService içinde loglanıyor
            // Kayıt işlemini etkilemesin
        }
    }
}