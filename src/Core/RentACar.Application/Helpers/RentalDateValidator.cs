using RentACar.Application.DTOs;

namespace RentACar.Application.Helpers
{
    /// <summary>
    /// Rezervasyon iş kurallarını merkezileştiren yardımcı.
    /// Frontend'e bağımsız — tüm rezervasyon uçları buradan geçmelidir.
    /// </summary>
    public static class RentalDateValidator
    {
        // İş Kuralları
        public const int MIN_ADVANCE_MINUTES = 30;  // Minimum 30 dakika hazırlık
        public const int MIN_RENTAL_DAYS = 1;        // Minimum 1 gün kiralama
        public const int MAX_ADVANCE_DAYS = 365;     // Maksimum 1 yıl ileri

        public static ValidationResult Validate(DateTime rentStartDate, DateTime rentEndDate)
        {
            var now = GetTurkeyNow();

            // 1. Alış geçmişte mi?
            if (rentStartDate <= now)
            {
                return ValidationResult.Fail(
                    $"Alış tarihi ve saati geçmişte olamaz. Şu an: {now:dd.MM.yyyy HH:mm}"
                );
            }

            // 2. Minimum hazırlık süresi (30 dakika)
            var minPickup = now.AddMinutes(MIN_ADVANCE_MINUTES);
            if (rentStartDate < minPickup)
            {
                return ValidationResult.Fail(
                    $"Alış zamanı şu andan en az {MIN_ADVANCE_MINUTES} dakika sonra olmalı. En erken: {minPickup:dd.MM.yyyy HH:mm}"
                );
            }

            // 3. Maksimum ileri gün
            var maxDate = now.AddDays(MAX_ADVANCE_DAYS);
            if (rentStartDate > maxDate)
            {
                return ValidationResult.Fail(
                    $"En fazla {MAX_ADVANCE_DAYS} gün ileri rezervasyon yapılabilir."
                );
            }

            // 4. İade alıştan sonra mı?
            if (rentEndDate <= rentStartDate)
            {
                return ValidationResult.Fail("İade tarihi alış tarihinden sonra olmalı.");
            }

            // 5. Minimum kiralama süresi
            var totalDays = (rentEndDate - rentStartDate).TotalDays;
            if (totalDays < MIN_RENTAL_DAYS)
            {
                return ValidationResult.Fail(
                    $"Minimum kiralama süresi {MIN_RENTAL_DAYS} gün."
                );
            }

            return ValidationResult.Ok();
        }

        private static DateTime GetTurkeyNow()
        {
            var turkeyTz = TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows() ? "Turkey Standard Time" : "Europe/Istanbul");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, turkeyTz);
        }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }

        public static ValidationResult Ok() => new() { IsValid = true };
        public static ValidationResult Fail(string message) => new() { IsValid = false, ErrorMessage = message };
    }
}