using System.Globalization;
using Microsoft.Extensions.Logging;
using RentACar.Application.Interfaces;

namespace RentACar.Infrastructure.Services;

/// <summary>
/// MERNİS doğrulama servisi.
///
/// Gerçek NVİ KPSPublic.asmx servisi 30.09.2025'te kamuya kapatıldığı için
/// (sadece KPS Kurumsal üyeliği olan kurumlar erişebilir),
/// bu servis aşağıdaki kontrolleri yaparak MERNİS'i simüle eder:
///
///   1. TC algoritma kontrolü (matematiksel olarak geçerli mi?)
///   2. Ad/Soyad format kontrolü
///   3. Doğum yılı makul aralık kontrolü
///
/// Production'da KPS Kurumsal üyeliği alındığında, bu servis yerine
/// kurumsal endpoint'i kullanan bir implementation eklenebilir.
/// </summary>
public class MernisIdentityValidationService : IIdentityValidationService
{
    private readonly ILogger<MernisIdentityValidationService> _logger;

    public MernisIdentityValidationService(ILogger<MernisIdentityValidationService> logger)
    {
        _logger = logger;
    }

    public Task<bool> ValidateTcKimlikNoAsync(string tcKimlikNo, string firstName, string lastName, int birthYear)
    {
        _logger.LogInformation("MERNİS doğrulaması başlatıldı: TC={Tc}, Ad={Ad}, Soyad={Soyad}, Yıl={Yıl}",
            MaskTc(tcKimlikNo), firstName, lastName, birthYear);

        // 1. TC Kimlik No formatı ve algoritma kontrolü
        if (!IsValidTcKimlikNo(tcKimlikNo))
        {
            _logger.LogWarning("MERNİS: TC Kimlik No algoritma kontrolünü geçemedi.");
            return Task.FromResult(false);
        }

        // 2. Ad/Soyad boşluk kontrolü
        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName))
        {
            _logger.LogWarning("MERNİS: Ad veya Soyad boş.");
            return Task.FromResult(false);
        }

        // 3. Ad/Soyad uzunluk kontrolü
        if (firstName.Trim().Length < 2 || lastName.Trim().Length < 2)
        {
            _logger.LogWarning("MERNİS: Ad veya Soyad çok kısa.");
            return Task.FromResult(false);
        }

        // 4. Ad/Soyad sadece harf ve boşluk içermeli (Türkçe karakter dahil)
        if (!IsValidNameFormat(firstName) || !IsValidNameFormat(lastName))
        {
            _logger.LogWarning("MERNİS: Ad veya Soyad geçersiz karakter içeriyor.");
            return Task.FromResult(false);
        }

        // 5. Doğum yılı makul aralıkta mı? (1900-bugün)
        var currentYear = DateTime.Now.Year;
        if (birthYear < 1900 || birthYear > currentYear)
        {
            _logger.LogWarning("MERNİS: Doğum yılı geçersiz aralıkta: {Yıl}", birthYear);
            return Task.FromResult(false);
        }

        // 6. Yaş kontrolü (en az 18)
        if (currentYear - birthYear < 18)
        {
            _logger.LogWarning("MERNİS: 18 yaş altı kayıt denemesi.");
            return Task.FromResult(false);
        }

        _logger.LogInformation("MERNİS: Doğrulama başarılı. (Demo modu)");
        return Task.FromResult(true);
    }

    /// <summary>
    /// TC Kimlik No'nun matematiksel olarak geçerliliğini kontrol eder.
    /// Resmi NVİ algoritması:
    ///   - 11 hane olmalı
    ///   - İlk hane 0 olamaz
    ///   - 10. hane = ((1+3+5+7+9. hanelerin toplamı) * 7 - (2+4+6+8. hanelerin toplamı)) mod 10
    ///   - 11. hane = ilk 10 hanenin toplamı mod 10
    /// </summary>
    private static bool IsValidTcKimlikNo(string tc)
    {
        if (string.IsNullOrWhiteSpace(tc) || tc.Length != 11)
            return false;

        if (!tc.All(char.IsDigit))
            return false;

        // İlk hane 0 olamaz
        if (tc[0] == '0')
            return false;

        var digits = tc.Select(c => c - '0').ToArray();

        // 10. hane kontrolü
        int oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        int tenthDigit = ((oddSum * 7) - evenSum) % 10;
        if (tenthDigit < 0) tenthDigit += 10;

        if (tenthDigit != digits[9])
            return false;

        // 11. hane kontrolü
        int sumOfFirstTen = digits.Take(10).Sum();
        int eleventhDigit = sumOfFirstTen % 10;

        return eleventhDigit == digits[10];
    }

    /// <summary>
    /// Ad/Soyad alanlarının sadece harf, boşluk ve Türkçe karakter içerdiğini kontrol eder.
    /// </summary>
    private static bool IsValidNameFormat(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;

        // Sadece harf, boşluk ve Türkçe karakterler
        foreach (var ch in name.Trim())
        {
            if (!char.IsLetter(ch) && ch != ' ' && ch != '-' && ch != '\'')
                return false;
        }

        return true;
    }

    /// <summary>
    /// Loglarda TC numarasının ortasını gizler (privacy).
    /// </summary>
    private static string MaskTc(string tc)
    {
        if (string.IsNullOrEmpty(tc) || tc.Length < 11) return "***";
        return $"{tc[..3]}*****{tc[^3..]}";
    }
}