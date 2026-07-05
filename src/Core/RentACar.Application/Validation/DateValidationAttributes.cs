using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.Validation
{
    /// <summary>
    /// Bir DateTime property'nin gelecekte olduğunu ve minimum X dakika sonrası olduğunu kontrol eder.
    /// Kullanım: [FutureDate(MinMinutesAhead = 30)]
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class FutureDateAttribute : ValidationAttribute
    {
        public int MinMinutesAhead { get; set; } = 0;
        public int MaxDaysAhead { get; set; } = 365;

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
                return ValidationResult.Success;

            if (value is not DateTime dateTime)
                return new ValidationResult("Geçersiz tarih formatı.");

            var now = GetTurkeyNow();

            // 1. Geçmişte olamaz
            if (dateTime <= now)
            {
                return new ValidationResult(
                    $"{validationContext.DisplayName} geçmişte olamaz. Şu an: {now:dd.MM.yyyy HH:mm}, Girilen: {dateTime:dd.MM.yyyy HH:mm}"
                );
            }

            // 2. Minimum hazırlık süresi kontrolü
            if (MinMinutesAhead > 0)
            {
                var minTime = now.AddMinutes(MinMinutesAhead);
                if (dateTime < minTime)
                {
                    return new ValidationResult(
                        $"{validationContext.DisplayName} şu andan en az {MinMinutesAhead} dakika sonra olmalı. En erken: {minTime:dd.MM.yyyy HH:mm}"
                    );
                }
            }

            // 3. Maksimum ileri gün kontrolü
            if (MaxDaysAhead > 0)
            {
                var maxTime = now.AddDays(MaxDaysAhead);
                if (dateTime > maxTime)
                {
                    return new ValidationResult(
                        $"{validationContext.DisplayName} en fazla {MaxDaysAhead} gün ileri olabilir."
                    );
                }
            }

            return ValidationResult.Success;
        }

        private static DateTime GetTurkeyNow()
        {
            var turkeyTz = TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows() ? "Turkey Standard Time" : "Europe/Istanbul");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, turkeyTz);
        }
    }

    /// <summary>
    /// Bir tarih aralığının minimum X gün süreli olduğunu kontrol eder.
    /// Kullanım: [DateRange("RentStartDate", MinDays = 1)] üzerinde RentEndDate
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class DateRangeAttribute : ValidationAttribute
    {
        public string StartDateProperty { get; }
        public int MinDays { get; set; } = 1;

        public DateRangeAttribute(string startDateProperty)
        {
            StartDateProperty = startDateProperty;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
                return ValidationResult.Success;

            if (value is not DateTime endDate)
                return new ValidationResult("Geçersiz tarih formatı.");

            var startDateProp = validationContext.ObjectType.GetProperty(StartDateProperty);
            if (startDateProp == null)
                return new ValidationResult($"'{StartDateProperty}' property bulunamadı.");

            var startDateValue = startDateProp.GetValue(validationContext.ObjectInstance);
            if (startDateValue is not DateTime startDate)
                return ValidationResult.Success;

            // İade, alıştan sonra mı?
            if (endDate <= startDate)
            {
                return new ValidationResult(
                    $"{validationContext.DisplayName} başlangıç tarihinden sonra olmalı."
                );
            }

            // Minimum süre kontrolü
            var diff = endDate - startDate;
            if (diff.TotalDays < MinDays)
            {
                return new ValidationResult(
                    $"Minimum kiralama süresi {MinDays} gün olmalı."
                );
            }

            return ValidationResult.Success;
        }
    }
}