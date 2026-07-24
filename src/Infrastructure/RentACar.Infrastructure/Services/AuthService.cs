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
        IEmailService emailService)   
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _jwtTokenHelper = jwtTokenHelper;
        _identityService = identityService;
        _findeksService = findeksService;
        _emailService = emailService; 
        
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

    
 
    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: ŞİFREMİ UNUTTUM — Mail'e reset linki gönderir
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<bool>> ForgotPasswordAsync(ForgotPasswordDto dto, string? ipAddress)
    {
        // Kullanıcıyı bul
        var user = await _unitOfWork.Repository<User>()
            .GetWhere(u => u.Email == dto.Email && !u.IsDeleted)
            .FirstOrDefaultAsync();
 
        // ⚠️ GÜVENLİK: Kullanıcı yoksa bile SUCCESS dön.
        // "Email varsa mail gitti" — email enumeration saldırısına karşı koruma
        if (user == null)
            return ApiResponse<bool>.SuccessResult(true,
                "E-posta adresiniz sistemde kayıtlıysa şifre sıfırlama linki gönderilecektir.");
 
        // Rate limit: Son 1 dakikada 3'ten fazla talep varsa reddet
        var oneMinuteAgo = DateTime.UtcNow.AddMinutes(-1);
        var recentRequests = await _unitOfWork.Repository<PasswordReset>()
            .GetWhere(r => r.UserId == user.Id && r.CreatedDate > oneMinuteAgo)
            .CountAsync();
 
        if (recentRequests >= 3)
            return ApiResponse<bool>.ErrorResult(
                "Çok fazla istek yaptınız. Lütfen 1 dakika sonra tekrar deneyin.");
 
        // Kullanıcının önceki kullanılmamış token'larını iptal et (birden fazla aktif olmasın)
        var oldTokens = await _unitOfWork.Repository<PasswordReset>()
            .GetWhere(r => r.UserId == user.Id && !r.IsUsed && r.ExpiresAt > DateTime.UtcNow)
            .ToListAsync();
 
        foreach (var oldToken in oldTokens)
        {
            oldToken.IsUsed = true;
            oldToken.UsedAt = DateTime.UtcNow;
            _unitOfWork.Repository<PasswordReset>().Update(oldToken);
        }
 
        // Yeni güvenli token oluştur (URL-safe base64)
        var tokenBytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
 
        var reset = new PasswordReset
        {
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(1),   // 1 saat geçerli
            RequestedFromIp = ipAddress
        };
 
        await _unitOfWork.Repository<PasswordReset>().AddAsync(reset);
        await _unitOfWork.SaveChangesAsync();
 
        // Mail gönder (fire-and-forget — kullanıcı akışı geçmesin)
        _ = SendPasswordResetEmailSafeAsync(user.Id, token);
 
        return ApiResponse<bool>.SuccessResult(true,
            "E-posta adresiniz sistemde kayıtlıysa şifre sıfırlama linki gönderilecektir.");
    }
 
    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: ŞİFRE SIFIRLA — Token ile yeni şifre ayarlar, JWT döner
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<string>> ResetPasswordAsync(ResetPasswordDto dto)
    {
        // Token'ı bul (aktif ve süresi dolmamış)
        var reset = await _unitOfWork.Repository<PasswordReset>()
            .GetWhere(r => r.Token == dto.Token
                        && !r.IsUsed
                        && r.ExpiresAt > DateTime.UtcNow)
            .Include(r => r.User)
            .FirstOrDefaultAsync();
 
        if (reset == null)
            return ApiResponse<string>.ErrorResult(
                "Geçersiz veya süresi dolmuş bağlantı. Lütfen yeni bir şifre sıfırlama talebinde bulunun.");
 
        if (reset.User == null)
            return ApiResponse<string>.ErrorResult("Kullanıcı bulunamadı.");
 
        // ⚠️ Yeni şifre eski şifre ile aynı mı? (opsiyonel güvenlik)
        if (PasswordHasher.VerifyPassword(dto.NewPassword, reset.User.PasswordHash))
            return ApiResponse<string>.ErrorResult(
                "Yeni şifreniz eski şifrenizle aynı olamaz.");
 
        // Şifreyi güncelle
        reset.User.PasswordHash = PasswordHasher.HashPassword(dto.NewPassword);
        reset.User.UpdatedDate = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(reset.User);
 
        // Token'ı işaretle
        reset.IsUsed = true;
        reset.UsedAt = DateTime.UtcNow;
        _unitOfWork.Repository<PasswordReset>().Update(reset);
 
        await _unitOfWork.SaveChangesAsync();
 
        // ⭐ Otomatik giriş için JWT oluştur
        string fullName = $"{reset.User.FirstName} {reset.User.LastName}";
        var jwt = _jwtTokenHelper.GenerateToken(
            reset.User.Id,
            reset.User.Email,
            fullName,
            reset.User.CompanyId ?? 0,
            new List<string> { reset.User.Role }
        );
 
        return ApiResponse<string>.SuccessResult(jwt,
            "Şifreniz başarıyla güncellendi. Otomatik olarak giriş yapıldı.");
    }
 
    // ═══════════════════════════════════════════════════════════════════
    // ⭐ YENİ: Şifre sıfırlama mail gönderim helper (fire-and-forget)
    // ═══════════════════════════════════════════════════════════════════
    private async Task SendPasswordResetEmailSafeAsync(int userId, string token)
    {
        try
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
            if (user != null)
                await _emailService.SendPasswordResetEmailAsync(user, token);
        }
        catch
        {
            // Sessizce yut - EmailService loglar
        }
    }
 
 
}