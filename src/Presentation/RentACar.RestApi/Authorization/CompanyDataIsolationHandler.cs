using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace RentACar.RestApi.Authorization;

//CompanyDataIsolationHandler = Şirket Veri İzolasyon Koruyucusu

// 1. Kural Tanımı (Requirement)
public class CompanyDataRequirement : IAuthorizationRequirement { }

// 2. Kural Kontrolcüsü (Handler)
public class CompanyDataIsolationHandler : AuthorizationHandler<CompanyDataRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CompanyDataIsolationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, CompanyDataRequirement requirement)
    {
        // Kural 1: Eğer kullanıcı "Admin" ise (Tüm sisteme hakimse) kontrolü geç.
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return Task.CompletedTask;

        // Kural 2: Kullanıcının Token'ındaki CompanyId'yi al.
        var userCompanyId = context.User.FindFirst("companyId")?.Value;

        // Kural 3: İstek atılan (Route veya Query) CompanyId'yi al.
        string? requestCompanyId = null;
        if (httpContext.Request.RouteValues.TryGetValue("companyId", out var routeVal))
            requestCompanyId = routeVal?.ToString();
        else if (httpContext.Request.Query.TryGetValue("companyId", out var queryVal))
            requestCompanyId = queryVal.ToString();

        // Eğer bir şirket kısıtlaması hedeflenmiyorsa (Genel bir liste çekiliyorsa) izin ver.
        if (string.IsNullOrEmpty(requestCompanyId))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Kural 4: Karşılaştır. Eğer Token'daki ID ile istekteki ID aynıysa geçişe izin ver.
        if (userCompanyId == requestCompanyId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

/*
CompanyDataIsolationHandler Kodunun Çözdüğü Sorun (Güvenlik Duvarı)
Diyelim ki kötü niyetli bir Admin var (veya bir yazılım hatası oldu). Bu kişi Swagger'ı açtı veya tarayıcının "Network" kısmından yakaladığı bir isteği manipüle etti.

Normalde kendi ürün ID'si: 101

Rakip şirketin ürün ID'si: 202

Bu kişi GET /api/Product/202 (Ürün Detayı) veya DELETE /api/Product/202 şeklinde bir istek gönderirse ne olur? Eğer senin kodun sadece "id"ye bakıp ürünü siliyorsa, X şirketi Y şirketinin ürününü silebilir.
İşte bu profesyonel kod (CompanyDataIsolationHandler) burada devreye giriyor. İşlem yapılmadan hemen önce; "Bu ürünün bağlı olduğu CompanyId ile, giriş yapan kullanıcının Token'ındaki CompanyId aynı mı?" diye son bir kontrol yapıyor.


Program.cs Kaydı tamamlandıktan sonra, Controller'da kullanımı çok basit:

Artık bu politikayı istediğim Controller'ın tepesine tek bir satırla ekleyebilirim
[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "CompanyIsolation")] // İşte bu kadar! Artık otomatik korunuyor.
public class ProductController : ControllerBase
{
   ... 
}


*/