using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RentACar.Application.DTOs.Payment;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;
using RentACar.Infrastructure.Configurations;
using RentACar.Infrastructure.Services.Iyzico;

namespace RentACar.Infrastructure.Services;

/// <summary>
/// Iyzico REST API entegrasyonu — .NET 9+ uyumlu, paket bağımlılığı yok.
/// </summary>
public class IyzicoPaymentService : IPaymentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IyzicoSettings _settings;
    private readonly ILogger<IyzicoPaymentService> _logger;
    private readonly IyzicoRestClient _iyzicoClient;
    private readonly IServiceScopeFactory _scopeFactory;   // ⭐ YENİ

    public IyzicoPaymentService(
        IUnitOfWork unitOfWork,
        IOptions<IyzicoSettings> settings,
        ILogger<IyzicoPaymentService> logger,
        IHttpClientFactory httpFactory,
        ILoggerFactory loggerFactory,
        IServiceScopeFactory scopeFactory)   // ⭐ YENİ parametre
    {
        _unitOfWork = unitOfWork;
        _settings = settings.Value;
        _logger = logger;
        _scopeFactory = scopeFactory;   // ⭐ YENİ

        var httpClient = httpFactory.CreateClient("Iyzico");
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        _iyzicoClient = new IyzicoRestClient(
            httpClient,
            _settings.ApiKey,
            _settings.SecretKey,
            _settings.BaseUrl,
            loggerFactory.CreateLogger<IyzicoRestClient>());
    }

    // ═══════════════════════════════════════════════════════════════════
    // 1. 3DS ÖDEME BAŞLATMA
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<PaymentInitResponseDto>> InitThreeDSPaymentAsync(
        int currentUserId, InitPaymentDto dto)
    {
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .Include(c => c.User)
            .FirstOrDefaultAsync();

        if (customer == null)
            return ApiResponse<PaymentInitResponseDto>.ErrorResult("Müşteri profili bulunamadı.");

        var rental = await _unitOfWork.Repository<Rental>()
            .GetWhere(r => r.Id == dto.RentalId && r.CustomerId == customer.Id && !r.IsDeleted)
            .Include(r => r.Car).ThenInclude(c => c.Brand)
            .FirstOrDefaultAsync();

        if (rental == null)
            return ApiResponse<PaymentInitResponseDto>.ErrorResult("Rezervasyon bulunamadı.");

        if (rental.IsPaid)
            return ApiResponse<PaymentInitResponseDto>.ErrorResult("Bu rezervasyon zaten ödendi.");

        var conversationId = $"CONV-{rental.Id}-{Guid.NewGuid():N}"[..40];
        var priceStr = rental.TotalAmount.ToString("F2", CultureInfo.InvariantCulture);

        var buyerName = FirstNonEmpty(rental.DriverFirstName, customer.User?.FirstName, "Customer");
        var buyerSurname = FirstNonEmpty(rental.DriverLastName, customer.User?.LastName, "User");
        var contactName = $"{buyerName} {buyerSurname}".Trim();
        var addressDescription = FirstNonEmpty(rental.DriverAddress, "Turkey");

        var request = new ThreeDSInitRequest
        {
            Locale = "tr",
            ConversationId = conversationId,
            Price = priceStr,
            PaidPrice = priceStr,
            Currency = "TRY",
            Installment = 1,
            BasketId = $"B-{rental.Id}",
            PaymentChannel = "WEB",
            PaymentGroup = "PRODUCT",
            CallbackUrl = _settings.CallbackUrl,

            PaymentCard = new IyzicoPaymentCard
            {
                CardHolderName = dto.CardHolderName.Trim(),
                CardNumber = dto.CardNumber.Trim(),
                ExpireMonth = dto.ExpireMonth,
                ExpireYear = dto.ExpireYear,
                Cvc = dto.Cvc,
                RegisterCard = 0
            },

            Buyer = new IyzicoBuyer
            {
                Id = customer.Id.ToString(),
                Name = buyerName,
                Surname = buyerSurname,
                GsmNumber = NormalizePhone(FirstNonEmpty(rental.DriverPhone, customer.User?.Phone, "+905555555555")),
                Email = FirstNonEmpty(rental.DriverEmail, customer.User?.Email, "buyer@example.com"),
                IdentityNumber = FirstNonEmpty(rental.DriverIdentityNumber, "11111111111"),
                RegistrationAddress = addressDescription,
                Ip = "85.34.78.112",
                City = "Istanbul",
                Country = "Turkey",
                ZipCode = "34732"
            },

            ShippingAddress = new IyzicoAddress
            {
                ContactName = contactName,
                City = "Istanbul",
                Country = "Turkey",
                Address = addressDescription,
                ZipCode = "34732"
            },

            BillingAddress = new IyzicoAddress
            {
                ContactName = contactName,
                City = "Istanbul",
                Country = "Turkey",
                Address = addressDescription,
                ZipCode = "34732"
            },

            BasketItems = new List<IyzicoBasketItem>
            {
                new()
                {
                    Id = $"CAR-{rental.CarId}",
                    Name = $"{rental.Car.Brand?.Name} {rental.Car.Model} - {rental.TotalDays} gun",
                    Category1 = "Car Rental",
                    ItemType = "VIRTUAL",
                    Price = priceStr
                }
            }
        };

        var payment = new Payment
        {
            RentalId = rental.Id,
            Amount = rental.TotalAmount,
            Currency = "TRY",
            Method = PaymentMethod.OnlineCard,
            Status = PaymentStatus.Pending,
            ConversationId = conversationId,
            CardHolderName = MaskName(dto.CardHolderName),
            MaskedCardNumber = MaskCardNumber(dto.CardNumber)
        };

        await _unitOfWork.Repository<Payment>().AddAsync(payment);
        await _unitOfWork.SaveChangesAsync();

        try
        {
            _logger.LogInformation("Iyzico 3DS Init: Rental={RentalId}, Amount={Amount}",
                rental.Id, rental.TotalAmount);

            var iyzicoResponse = await _iyzicoClient.PostAsync<ThreeDSInitResponse>(
                "/payment/3dsecure/initialize", request);

            if (iyzicoResponse == null)
            {
                await MarkPaymentFailedAsync(payment, "NO_RESPONSE", "Iyzico'dan yanıt alınamadı.");
                return ApiResponse<PaymentInitResponseDto>.ErrorResult(
                    "Ödeme sistemi yanıt vermiyor. Lütfen tekrar deneyin.");
            }

            if (iyzicoResponse.Status != "success")
            {
                await MarkPaymentFailedAsync(payment, iyzicoResponse.ErrorCode, iyzicoResponse.ErrorMessage);
                _logger.LogWarning("Iyzico 3DS Init hata: {Code} - {Msg}",
                    iyzicoResponse.ErrorCode, iyzicoResponse.ErrorMessage);

                return ApiResponse<PaymentInitResponseDto>.ErrorResult(
                    TranslateIyzicoError(iyzicoResponse.ErrorCode, iyzicoResponse.ErrorMessage));
            }

            if (string.IsNullOrEmpty(iyzicoResponse.ThreeDSHtmlContent))
            {
                await MarkPaymentFailedAsync(payment, "NO_3DS_HTML", "3DS HTML içeriği alınamadı.");
                return ApiResponse<PaymentInitResponseDto>.ErrorResult("3DS içeriği alınamadı.");
            }

            var htmlContent = System.Text.Encoding.UTF8.GetString(
                Convert.FromBase64String(iyzicoResponse.ThreeDSHtmlContent));

            var response = new PaymentInitResponseDto
            {
                ThreeDSHtmlContent = htmlContent,
                ConversationId = conversationId,
                PaymentId = iyzicoResponse.PaymentId
            };

            return ApiResponse<PaymentInitResponseDto>.SuccessResult(response,
                "3DS ödeme başlatıldı, kart doğrulaması bekleniyor.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Iyzico 3DS Init exception. Rental: {RentalId}", rental.Id);
            await MarkPaymentFailedAsync(payment, "EXCEPTION", ex.Message);
            return ApiResponse<PaymentInitResponseDto>.ErrorResult(
                "Ödeme sistemi şu an cevap vermiyor. Lütfen daha sonra tekrar deneyin.");
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. 3DS CALLBACK
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<int>> ProcessThreeDSCallbackAsync(ThreeDSCallbackDto dto)
    {
        var payment = await _unitOfWork.Repository<Payment>()
            .GetWhere(p => p.ConversationId == dto.ConversationId && !p.IsDeleted)
            .Include(p => p.Rental)
            .FirstOrDefaultAsync();

        if (payment == null)
        {
            _logger.LogWarning("Callback: Payment bulunamadı. ConvId: {Id}", dto.ConversationId);
            return ApiResponse<int>.ErrorResult("Ödeme kaydı bulunamadı.");
        }

        if (payment.Status == PaymentStatus.Success)
            return ApiResponse<int>.SuccessResult(payment.RentalId, "Zaten başarılı.");

        if (dto.Status != "success" || dto.MdStatus != "1")
        {
            await MarkPaymentFailedAsync(payment, "3DS_FAILED",
                $"3DS doğrulaması başarısız (mdStatus: {dto.MdStatus})");

            _logger.LogWarning("3DS başarısız. ConvId: {Id}, MdStatus: {Md}",
                dto.ConversationId, dto.MdStatus);

            return ApiResponse<int>.ErrorResult(
                "Kart doğrulaması başarısız oldu. Lütfen tekrar deneyin.");
        }

        try
        {
            var request = new ThreeDSCompleteRequest
            {
                Locale = "tr",
                ConversationId = dto.ConversationId,
                PaymentId = dto.PaymentId,
                ConversationData = dto.ConversationData
            };

            var result = await _iyzicoClient.PostAsync<ThreeDSCompleteResponse>(
                "/payment/3dsecure/auth", request);

            if (result == null || result.Status != "success")
            {
                var code = result?.ErrorCode ?? "COMPLETE_FAILED";
                var msg = result?.ErrorMessage ?? "Ödeme tamamlanamadı";
                await MarkPaymentFailedAsync(payment, code, msg);
                return ApiResponse<int>.ErrorResult(TranslateIyzicoError(code, msg));
            }

            payment.Status = PaymentStatus.Success;
            payment.IyzicoPaymentId = result.PaymentId;
            payment.IyzicoConversationId = result.ConversationId;
            payment.PaymentTransactionId = result.PaymentItems?.FirstOrDefault()?.PaymentTransactionId;
            payment.CardFamily = result.CardFamily;
            payment.CardType = result.CardType;
            payment.CardAssociation = result.CardAssociation;
            payment.CompletedDate = DateTime.UtcNow;
            payment.UpdatedDate = DateTime.UtcNow;

            var rental = payment.Rental;
            rental.IsPaid = true;
            rental.Status = ReservationStatus.Approved;
            rental.UpdatedDate = DateTime.UtcNow;

            var car = await _unitOfWork.Repository<Car>().GetByIdAsync(rental.CarId);
            if (car != null)
            {
                car.Status = CarStatus.Rented;
                _unitOfWork.Repository<Car>().Update(car);
            }

            _unitOfWork.Repository<Rental>().Update(rental);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Ödeme başarılı. Rental={Id}, Amount={Amt}",
                rental.Id, payment.Amount);

            // ⭐ Ödeme başarılı - onay maili gönder (kendi scope'unda, güvenli)
            _ = SendPaymentConfirmationEmailSafeAsync(rental.Id);

            return ApiResponse<int>.SuccessResult(rental.Id, "Ödeme başarılı!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "3DS callback exception.");
            await MarkPaymentFailedAsync(payment, "EXCEPTION", ex.Message);
            return ApiResponse<int>.ErrorResult("Ödeme sonucu işlenirken hata oluştu.");
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. IPTAL (X butonu ile)
    // ═══════════════════════════════════════════════════════════════════
    public async Task<ApiResponse<bool>> CancelPendingPaymentAsync(int currentUserId, CancelPaymentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ConversationId))
            return ApiResponse<bool>.ErrorResult("Geçersiz istek.");

        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.UserId == currentUserId && !c.IsDeleted)
            .FirstOrDefaultAsync();

        if (customer == null)
            return ApiResponse<bool>.ErrorResult("Müşteri profili bulunamadı.");

        var payment = await _unitOfWork.Repository<Payment>()
            .GetWhere(p => p.ConversationId == dto.ConversationId && !p.IsDeleted)
            .Include(p => p.Rental)
            .FirstOrDefaultAsync();

        if (payment == null)
            return ApiResponse<bool>.SuccessResult(true, "Payment kaydı bulunamadı.");

        if (payment.Rental == null || payment.Rental.CustomerId != customer.Id)
            return ApiResponse<bool>.ErrorResult("Bu ödemeyi iptal etme yetkiniz yok.");

        if (payment.Status != PaymentStatus.Pending)
            return ApiResponse<bool>.SuccessResult(true, "Ödeme zaten sonlandırılmış.");

        payment.Status = PaymentStatus.Cancelled;
        payment.ErrorMessage = "Kullanıcı 3DS akışını iptal etti.";
        payment.UpdatedDate = DateTime.UtcNow;
        _unitOfWork.Repository<Payment>().Update(payment);

        if (payment.Rental.Status == ReservationStatus.Pending)
        {
            payment.Rental.Status = ReservationStatus.Cancelled;
            payment.Rental.CancelReason = "Ödeme tamamlanmadı";
            payment.Rental.CancelledDate = DateTime.UtcNow;
            payment.Rental.UpdatedDate = DateTime.UtcNow;
            _unitOfWork.Repository<Rental>().Update(payment.Rental);
        }

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Payment cancelled by user. ConversationId: {Cid}, PaymentId: {Pid}, RentalId: {Rid}",
            dto.ConversationId, payment.Id, payment.RentalId);

        return ApiResponse<bool>.SuccessResult(true, "Ödeme ve rezervasyon iptal edildi.");
    }

    // ═══════════════════════════════════════════════════════════════════
    // ⭐ EMAIL GÖNDERİM HELPER'I — KENDİ DBCONTEXT SCOPE'UNDA ÇALIŞIR
    // ═══════════════════════════════════════════════════════════════════

    /// <summary>
    /// Ödeme başarılı olduktan sonra onay maili gönderir.
    /// KENDI IServiceScope'unu oluşturur → HTTP request scope'una bağlı değil.
    /// Bu yüzden HTTP response döndükten sonra bile güvenli çalışır.
    /// </summary>
    private async Task SendPaymentConfirmationEmailSafeAsync(int rentalId)
    {
        try
        {
            Console.WriteLine($"[EMAIL-PAYMENT] Rental {rentalId} için mail başladı (yeni scope)");

            // ⭐ KRİTİK: Kendi scope'unu yarat, kendi DbContext'ini kullan
            using var scope = _scopeFactory.CreateScope();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var rental = await uow.Repository<Rental>()
                .GetWhere(r => r.Id == rentalId)
                .Include(r => r.Car).ThenInclude(c => c.Brand)
                .Include(r => r.PickUpLocation)
                .Include(r => r.DropOffLocation)
                .FirstOrDefaultAsync();

            if (rental == null)
            {
                Console.WriteLine($"[EMAIL-PAYMENT] HATA: Rental {rentalId} bulunamadı");
                return;
            }

            if (string.IsNullOrEmpty(rental.DriverEmail))
            {
                Console.WriteLine($"[EMAIL-PAYMENT] HATA: DriverEmail boş");
                return;
            }

            Console.WriteLine($"[EMAIL-PAYMENT] {rental.DriverEmail} adresine gönderiliyor...");
            var success = await emailService.SendReservationConfirmationAsync(rental);
            Console.WriteLine($"[EMAIL-PAYMENT] Sonuç: {success}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EMAIL-PAYMENT] EXCEPTION: {ex.Message}");
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════

    private async Task MarkPaymentFailedAsync(Payment payment, string? code, string? message)
    {
        payment.Status = PaymentStatus.Failed;
        payment.ErrorCode = code;
        payment.ErrorMessage = message;
        payment.UpdatedDate = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
    }

    private static string FirstNonEmpty(params string?[] values)
    {
        foreach (var v in values)
            if (!string.IsNullOrWhiteSpace(v))
                return v.Trim();
        return string.Empty;
    }

    private static string NormalizePhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return "+905555555555";
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length == 10) return "+90" + digits;
        if (digits.Length == 11 && digits.StartsWith("0")) return "+90" + digits[1..];
        if (digits.Length == 12 && digits.StartsWith("90")) return "+" + digits;
        return "+905555555555";
    }

    private static string MaskCardNumber(string cardNumber)
    {
        if (string.IsNullOrEmpty(cardNumber) || cardNumber.Length < 10) return "****";
        return $"{cardNumber[..4]} {cardNumber[4..6]}** **** {cardNumber[^4..]}";
    }

    private static string MaskName(string name)
    {
        if (string.IsNullOrEmpty(name)) return "***";
        return name.Length > 3 ? name[..3] + new string('*', name.Length - 3) : name;
    }

    private static string TranslateIyzicoError(string? code, string? message)
    {
        return code switch
        {
            "10005" => "Kart limiti yetersiz.",
            "10012" => "Geçersiz kart numarası.",
            "10034" => "Kart bilgileri hatalı, kontrol edin.",
            "10051" => "Kart bakiyesi yetersiz.",
            "10054" => "Kartın kullanım süresi dolmuş.",
            "10084" => "CVC kodu hatalı.",
            _ => message ?? "Ödeme başarısız oldu."
        };
    }
}