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

    public ReservationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
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

        return ApiResponse<ReservationDetailDto>.SuccessResult(dto);
    }
}