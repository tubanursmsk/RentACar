using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Insurance;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class ReservationService : IReservationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;   // ⭐ YENİ

    public ReservationService(IUnitOfWork unitOfWork, IEmailService emailService)   // ⭐ YENİ parametre
    {
        _unitOfWork = unitOfWork;
        _emailService = emailService;   // ⭐ YENİ
    }

    // ──────────────────────────────────────────
    // FİYAT HESAPLAMA (Step 2, 3'te canlı kullanılır)
    // ──────────────────────────────────────────
    public async Task<ApiResponse<PricePreviewDto>> CalculatePricePreviewAsync(PricePreviewRequestDto request)
    {
        // Validation
        if (request.RentEndDate <= request.RentStartDate)
            return ApiResponse<PricePreviewDto>.ErrorResult("Geçersiz tarih aralığı.");

        // Araç
        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(request.CarId);
        if (car == null || car.IsDeleted)
            return ApiResponse<PricePreviewDto>.ErrorResult("Araç bulunamadı.");

        var totalDays = Math.Max(1, (request.RentEndDate - request.RentStartDate).Days);

        // 1) Araç tutarı
        decimal subTotal = totalDays * car.DailyPrice;

        var lines = new List<PriceLineDto>
        {
            new() {
                Label = $"Araç Kira Bedeli",
                Detail = $"{totalDays} gün × ₺{car.DailyPrice:N0}",
                Amount = subTotal
            }
        };

        // 2) Sigorta tutarı
        decimal insuranceTotal = 0;
        if (request.InsurancePackageId.HasValue)
        {
            var package = await _unitOfWork.Repository<InsurancePackage>()
                .GetByIdAsync(request.InsurancePackageId.Value);
            if (package != null && !package.IsDeleted)
            {
                insuranceTotal = totalDays * package.DailyPrice;
                lines.Add(new PriceLineDto
                {
                    Label = $"{package.Name}",
                    Detail = $"{totalDays} gün × ₺{package.DailyPrice:N0}",
                    Amount = insuranceTotal
                });
            }
        }

        // 3) Ek ürün tutarı
        decimal productsTotal = 0;
        foreach (var item in request.AdditionalProducts)
        {
            if (item.Quantity < 1) continue;
            var product = await _unitOfWork.Repository<AdditionalProduct>()
                .GetByIdAsync(item.AdditionalProductId);
            if (product == null || product.IsDeleted) continue;

            decimal lineTotal = product.DailyPrice * item.Quantity * totalDays;
            productsTotal += lineTotal;

            lines.Add(new PriceLineDto
            {
                Label = $"{product.Name} (×{item.Quantity})",
                Detail = $"{totalDays} gün × ₺{product.DailyPrice:N0}",
                Amount = lineTotal
            });
        }

        var preview = new PricePreviewDto
        {
            TotalDays = totalDays,
            CarDailyPrice = car.DailyPrice,
            SubTotal = subTotal,
            InsuranceTotal = insuranceTotal,
            AdditionalProductsTotal = productsTotal,
            GrandTotal = subTotal + insuranceTotal + productsTotal,
            Lines = lines
        };

        return ApiResponse<PricePreviewDto>.SuccessResult(preview);
    }

    // ──────────────────────────────────────────
    // REZERVASYON OLUŞTURMA
    // ──────────────────────────────────────────
    public async Task<ApiResponse<int>> CreateReservationAsync(int currentUserId, CreateReservationDto dto)
    {
        // 1) Müşteri kontrolü
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .FirstOrDefaultAsync();
        if (customer == null)
            return ApiResponse<int>.ErrorResult("Müşteri profili bulunamadı.");

        // 2) Tarih kontrolü
        if (dto.RentStartDate < DateTime.Now.Date || dto.RentEndDate <= dto.RentStartDate)
            return ApiResponse<int>.ErrorResult("Geçersiz tarih aralığı.");

        // 3) Araç kontrolü
        var car = await _unitOfWork.Repository<Car>().GetByIdAsync(dto.CarId);
        if (car == null || car.IsDeleted)
            return ApiResponse<int>.ErrorResult("Araç bulunamadı.");

        // 4) Findeks (mevcut RentalService'teki kuralın aynısı)
        if (customer.FindeksScore < car.MinFindeksScore)
            return ApiResponse<int>.ErrorResult(
                $"Findeks puanınız yetersiz. (Gereken: {car.MinFindeksScore}, Sizin: {customer.FindeksScore})");

        // 5) Çakışma kontrolü
        bool isCarRented = await _unitOfWork.Repository<Rental>().AnyAsync(r =>
            r.CarId == dto.CarId &&
            !r.IsDeleted &&
            r.Status != ReservationStatus.Cancelled &&
            r.Status != ReservationStatus.Completed &&
            r.RentStartDate <= dto.RentEndDate &&
            r.RentEndDate >= dto.RentStartDate);

        if (isCarRented)
            return ApiResponse<int>.ErrorResult("Araç seçilen tarihler arasında dolu.");

        // 6) Fiyat hesapla (snapshot için)
        var totalDays = Math.Max(1, (dto.RentEndDate - dto.RentStartDate).Days);
        decimal subTotal = totalDays * car.DailyPrice;

        // 7) Sigorta paketi
        decimal insuranceTotal = 0;
        InsurancePackage? insurancePackage = null;
        if (dto.InsurancePackageId.HasValue)
        {
            insurancePackage = await _unitOfWork.Repository<InsurancePackage>()
                .GetByIdAsync(dto.InsurancePackageId.Value);
            if (insurancePackage != null)
                insuranceTotal = totalDays * insurancePackage.DailyPrice;
        }

        // 8) Ek ürünler
        decimal productsTotal = 0;
        var productLines = new List<RentalAdditionalProduct>();

        foreach (var item in dto.AdditionalProducts.Where(p => p.Quantity > 0))
        {
            var product = await _unitOfWork.Repository<AdditionalProduct>()
                .GetByIdAsync(item.AdditionalProductId);
            if (product == null || product.IsDeleted) continue;

            decimal lineTotal = product.DailyPrice * item.Quantity * totalDays;
            productsTotal += lineTotal;

            productLines.Add(new RentalAdditionalProduct
            {
                AdditionalProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.DailyPrice,
                TotalPrice = lineTotal
            });
        }

        // 9) Rental kaydını oluştur
        var rental = new Rental
        {
            CustomerId = customer.Id,
            CarId = dto.CarId,
            PickUpLocationId = dto.PickUpLocationId,
            DropOffLocationId = dto.DropOffLocationId,
            RentStartDate = dto.RentStartDate,
            RentEndDate = dto.RentEndDate,
            Status = ReservationStatus.Pending,
            IsPaid = false,

            SubTotal = subTotal,
            InsuranceTotal = insuranceTotal,
            AdditionalProductsTotal = productsTotal,
            TotalAmount = subTotal + insuranceTotal + productsTotal,

            InsurancePackageId = dto.InsurancePackageId,
            AdditionalProducts = productLines,

            DriverIdentityNumber = dto.DriverIdentityNumber,
            DriverFirstName = dto.DriverFirstName,
            DriverLastName = dto.DriverLastName,
            DriverBirthDate = dto.DriverBirthDate,
            DriverLicenseNumber = dto.DriverLicenseNumber,
            DriverPhone = dto.DriverPhone,
            DriverEmail = dto.DriverEmail,
            DriverAddress = dto.DriverAddress
        };

        await _unitOfWork.Repository<Rental>().AddAsync(rental);
        await _unitOfWork.SaveChangesAsync();

        // ⭐ YENİ: Rezervasyon onay maili gönder (fire-and-forget)
        // Email hatası rezervasyonu iptal etmez, kullanıcı akışı gecikmez
        _ = SendConfirmationEmailSafeAsync(rental.Id);

        return ApiResponse<int>.SuccessResult(rental.Id, "Rezervasyon başarıyla oluşturuldu.");
    }

    // ──────────────────────────────────────────
    // REZERVASYON DETAYI (ödeme sayfasında ve başarı sayfasında kullanılır)
    // ──────────────────────────────────────────
    public async Task<ApiResponse<ReservationDetailDto>> GetReservationDetailAsync(int reservationId, int currentUserId)
    {
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .FirstOrDefaultAsync();
        if (customer == null)
            return ApiResponse<ReservationDetailDto>.ErrorResult("Müşteri profili bulunamadı.");

        var rental = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.Id == reservationId && r.CustomerId == customer.Id && !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.PickUpLocation)
            .Include(r => r.DropOffLocation)
            .Include(r => r.InsurancePackage)
            .Include(r => r.AdditionalProducts).ThenInclude(ap => ap.AdditionalProduct)
            .FirstOrDefaultAsync();

        if (rental == null)
            return ApiResponse<ReservationDetailDto>.ErrorResult("Rezervasyon bulunamadı.");

        var dto = new ReservationDetailDto
        {
            Id = rental.Id,
            CarInfo = $"{rental.Car.Brand?.Name} {rental.Car.Model}",
            CarImageUrl = rental.Car.ImageUrl,
            PickUpLocationName = rental.PickUpLocation?.Name ?? "",
            DropOffLocationName = rental.DropOffLocation?.Name ?? "",
            RentStartDate = rental.RentStartDate,
            RentEndDate = rental.RentEndDate,
            TotalDays = rental.TotalDays,
            SubTotal = rental.SubTotal,
            InsuranceTotal = rental.InsuranceTotal,
            AdditionalProductsTotal = rental.AdditionalProductsTotal,
            TotalAmount = rental.TotalAmount,
            Status = rental.Status.ToString(),
            IsPaid = rental.IsPaid,
            CreatedDate = rental.CreatedDate,
            ReservationCode = rental.ReservationCode,
            CancelReason = rental.CancelReason,
            CancelledDate = rental.CancelledDate,
            InsurancePackage = rental.InsurancePackage != null ? new InsurancePackageDto
            {
                Id = rental.InsurancePackage.Id,
                Name = rental.InsurancePackage.Name,
                Code = rental.InsurancePackage.Code,
                DailyPrice = rental.InsurancePackage.DailyPrice,
                Description = rental.InsurancePackage.Description
            } : null,
            AdditionalProducts = rental.AdditionalProducts.Select(ap => new ReservationProductDetailDto
            {
                Name = ap.AdditionalProduct?.Name ?? "",
                Quantity = ap.Quantity,
                UnitPrice = ap.UnitPrice,
                TotalPrice = ap.TotalPrice
            }).ToList()
        };

        var now = GetTurkeyNow();
        dto.CanCancel = CanCancelReservation(rental, now);
        dto.CanEdit = CanEditReservation(rental, now);
        dto.CannotCancelReason = dto.CanCancel ? null : GetCannotCancelReason(rental, now);
        dto.HoursUntilPickup = rental.RentStartDate > now
            ? (int?)(rental.RentStartDate - now).TotalHours
            : null;

        return ApiResponse<ReservationDetailDto>.SuccessResult(dto);
    }

    // İş Kuralı: Alışa 24 saatten az kaldıysa iptal/düzenleme yapılamaz
    private const int MIN_HOURS_BEFORE_CHANGE = 24;

    // ═══════════════════════════════════════════════════════════════════
    // 1. Kullanıcının rezervasyon listesi (filtreli)
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<List<MyReservationDto>>> GetMyReservationsAsync(int currentUserId, string? filter = null)
    {
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .FirstOrDefaultAsync();

        if (customer == null)
        {
            return ApiResponse<List<MyReservationDto>>.SuccessResult(new List<MyReservationDto>(),
                "Henüz rezervasyonunuz bulunmuyor.");
        }

        var query = _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.CustomerId == customer.Id && !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .Include(r => r.PickUpLocation)
            .Include(r => r.DropOffLocation)
            .AsQueryable();

        var now = GetTurkeyNow();

        // Filtre uygula
        query = filter?.ToLower() switch
        {
            "active" => query.Where(r =>
                           (r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Approved)
                           && r.RentEndDate >= now),
            "past" => query.Where(r =>
                           r.Status == ReservationStatus.Completed
                           || (r.Status == ReservationStatus.Approved && r.RentEndDate < now)),
            "cancelled" => query.Where(r => r.Status == ReservationStatus.Cancelled),
            _ => query   // "all" veya null
        };

        var rentals = await query
            .OrderByDescending(r => r.CreatedDate)
            .ToListAsync();

        var dtos = rentals.Select(r =>
        {
            var hoursUntil = r.RentStartDate > now
                ? (int?)(r.RentStartDate - now).TotalHours
                : null;

            return new MyReservationDto
            {
                Id = r.Id,
                ReservationCode = r.ReservationCode,
                CarId = r.CarId,
                CarBrand = r.Car.Brand?.Name ?? "",
                CarModel = r.Car.Model,
                CarPlate = r.Car.Plate,
                CarImageUrl = r.Car.ImageUrl,
                RentStartDate = r.RentStartDate,
                RentEndDate = r.RentEndDate,
                TotalDays = r.TotalDays,
                PickUpLocationName = r.PickUpLocation?.Name ?? "",
                DropOffLocationName = r.DropOffLocation?.Name ?? "",
                TotalAmount = r.TotalAmount,
                Status = r.Status.ToString(),
                IsPaid = r.IsPaid,
                HoursUntilPickup = hoursUntil,
                CanCancel = CanCancelReservation(r, now),
                CanEdit = CanEditReservation(r, now),
                CreatedDate = r.CreatedDate
            };
        }).ToList();

        return ApiResponse<List<MyReservationDto>>.SuccessResult(dtos);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. Rezervasyon iptali
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<bool>> CancelMyReservationAsync(int reservationId, int currentUserId, CancelReservationDto dto)
    {
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .FirstOrDefaultAsync();

        if (customer == null)
            return ApiResponse<bool>.ErrorResult("Müşteri profili bulunamadı.");

        var rental = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.Id == reservationId && !r.IsDeleted)
            .FirstOrDefaultAsync();

        if (rental == null)
            return ApiResponse<bool>.ErrorResult("Rezervasyon bulunamadı.");

        if (rental.CustomerId != customer.Id)
            return ApiResponse<bool>.ErrorResult("Bu rezervasyonu iptal etme yetkiniz yok.");

        var now = GetTurkeyNow();
        if (!CanCancelReservation(rental, now))
        {
            return ApiResponse<bool>.ErrorResult(
                GetCannotCancelReason(rental, now) ?? "Bu rezervasyon iptal edilemez.");
        }

        rental.Status = ReservationStatus.Cancelled;
        rental.CancelReason = dto.Reason;
        rental.CancelledDate = now;
        rental.UpdatedDate = now;

        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Rezervasyon başarıyla iptal edildi.");
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. Rezervasyon tarih güncelleme
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<bool>> UpdateMyReservationDatesAsync(int reservationId, int currentUserId, UpdateReservationDatesDto dto)
    {
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .FirstOrDefaultAsync();

        if (customer == null)
            return ApiResponse<bool>.ErrorResult("Müşteri profili bulunamadı.");

        var rental = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.Id == reservationId && !r.IsDeleted)
            .Include(r => r.Car)
            .FirstOrDefaultAsync();

        if (rental == null)
            return ApiResponse<bool>.ErrorResult("Rezervasyon bulunamadı.");

        if (rental.CustomerId != customer.Id)
            return ApiResponse<bool>.ErrorResult("Bu rezervasyonu düzenleme yetkiniz yok.");

        var now = GetTurkeyNow();
        if (!CanEditReservation(rental, now))
            return ApiResponse<bool>.ErrorResult("Bu rezervasyon artık düzenlenemez.");

        // Yeni tarihleri validate et
        if (dto.NewRentStartDate < now)
            return ApiResponse<bool>.ErrorResult("Yeni alış tarihi geçmişte olamaz.");

        if (dto.NewRentStartDate < now.AddMinutes(30))
            return ApiResponse<bool>.ErrorResult("Yeni alış tarihi en az 30 dakika sonrası olmalı.");

        if (dto.NewRentEndDate <= dto.NewRentStartDate)
            return ApiResponse<bool>.ErrorResult("İade tarihi alış tarihinden sonra olmalı.");

        var newTotalDays = Math.Max(1, (dto.NewRentEndDate - dto.NewRentStartDate).Days);
        if (newTotalDays < 1)
            return ApiResponse<bool>.ErrorResult("Minimum kiralama süresi 1 gün.");

        if (dto.NewRentStartDate > now.AddDays(365))
            return ApiResponse<bool>.ErrorResult("En fazla 365 gün ileri rezervasyon yapılabilir.");

        // Aracın yeni tarihte müsait olup olmadığını kontrol et
        bool hasConflict = await _unitOfWork.Repository<Rental>().AnyAsync(r =>
            r.Id != reservationId &&
            r.CarId == rental.CarId &&
            !r.IsDeleted &&
            r.Status != ReservationStatus.Cancelled &&
            r.Status != ReservationStatus.Completed &&
            r.RentStartDate <= dto.NewRentEndDate &&
            r.RentEndDate >= dto.NewRentStartDate);

        if (hasConflict)
            return ApiResponse<bool>.ErrorResult("Seçilen tarihlerde araç başka bir rezervasyonda.");

        // Fiyatı yeniden hesapla
        var newSubTotal = newTotalDays * rental.Car.DailyPrice;

        var oldDays = Math.Max(1, rental.TotalDays);
        var insurancePerDay = rental.InsuranceTotal / oldDays;
        var productsPerDay = rental.AdditionalProductsTotal / oldDays;

        var newInsuranceTotal = insurancePerDay * newTotalDays;
        var newProductsTotal = productsPerDay * newTotalDays;
        var newTotalAmount = newSubTotal + newInsuranceTotal + newProductsTotal;

        rental.RentStartDate = dto.NewRentStartDate;
        rental.RentEndDate = dto.NewRentEndDate;
        rental.SubTotal = newSubTotal;
        rental.InsuranceTotal = newInsuranceTotal;
        rental.AdditionalProductsTotal = newProductsTotal;
        rental.TotalAmount = newTotalAmount;
        rental.UpdatedDate = now;

        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Rezervasyon tarihleri güncellendi.");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  EMAIL GÖNDERİM HELPER
    // ═══════════════════════════════════════════════════════════════════
    /// Rezervasyon onay mailini fire-and-forget ile gönderir.
    /// Email hatası rezervasyonu iptal etmez, kullanıcı akışını geciktirmez.

    private async Task SendConfirmationEmailSafeAsync(int rentalId)
    {
        try
        {
            // Rental'ı email için gerekli tüm ilişkilerle çek
            var rental = await _unitOfWork.Repository<Rental>()
                .GetWhere(r => r.Id == rentalId)
                .Include(r => r.Car).ThenInclude(c => c.Brand)
                .Include(r => r.PickUpLocation)
                .Include(r => r.DropOffLocation)
                .FirstOrDefaultAsync();

            if (rental != null)
            {
                // 1) Müşteriye onay maili (mevcut)
                await _emailService.SendReservationConfirmationAsync(rental);

                // ⭐ YENİ: 2) Firmaya bildirim maili (fire-and-forget)
                _ = _emailService.SendReservationNotificationToAdminAsync(rental);
            }
        }
        catch
        {
            // Email hatası zaten EmailService içinde loglanıyor
            // Burada sessiz kalıyoruz — rezervasyonu etkilemesin
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════

    private static bool CanCancelReservation(Rental rental, DateTime now)
    {
        if (rental.Status == ReservationStatus.Cancelled || rental.Status == ReservationStatus.Completed)
            return false;

        var hoursUntilPickup = (rental.RentStartDate - now).TotalHours;
        if (hoursUntilPickup < MIN_HOURS_BEFORE_CHANGE)
            return false;

        return true;
    }

    private static bool CanEditReservation(Rental rental, DateTime now)
    {
        if (rental.Status != ReservationStatus.Pending && rental.Status != ReservationStatus.Approved)
            return false;

        var hoursUntilPickup = (rental.RentStartDate - now).TotalHours;
        if (hoursUntilPickup < MIN_HOURS_BEFORE_CHANGE)
            return false;

        return true;
    }

    private static string? GetCannotCancelReason(Rental rental, DateTime now)
    {
        if (rental.Status == ReservationStatus.Cancelled)
            return "Bu rezervasyon zaten iptal edilmiş.";

        if (rental.Status == ReservationStatus.Completed)
            return "Tamamlanmış rezervasyonlar iptal edilemez.";

        var hoursUntilPickup = (rental.RentStartDate - now).TotalHours;
        if (hoursUntilPickup < MIN_HOURS_BEFORE_CHANGE)
        {
            if (hoursUntilPickup < 0)
                return "Alış tarihi geçtiği için iptal edilemez.";
            return $"Alış tarihine {MIN_HOURS_BEFORE_CHANGE} saatten az kaldığı için iptal edilemez.";
        }

        return null;
    }

    private static DateTime GetTurkeyNow()
    {
        try
        {
            var turkeyTz = TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows() ? "Turkey Standard Time" : "Europe/Istanbul");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, turkeyTz);
        }
        catch
        {
            return DateTime.Now;
        }
    }
}