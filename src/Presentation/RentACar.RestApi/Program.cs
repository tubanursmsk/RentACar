using RentACar.Application;
using RentACar.Infrastructure;
using RentACar.RestApi.Middleware; // Exception Middleware klasörün
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using RentACar.WebApi.Configurations;
using RentACar.Application.Mappings;
using Microsoft.AspNetCore.Mvc;
using RentACar.Application.DTOs.Responses;
using Microsoft.AspNetCore.Authorization;
using RentACar.RestApi.Authorization;
using RentACar.Domain.Entities;
using RentACar.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using RentACar.Infrastructure.Configurations;
using RentACar.Infrastructure.Services;
using RentACar.Application.Interfaces;
 

var builder = WebApplication.CreateBuilder(args);

//Katman Servisleri
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

//Controller ve JSON Ayarları
builder.Services.AddControllers();

// ═══ Iyzico Payment ═══
builder.Services.Configure<IyzicoSettings>(builder.Configuration.GetSection("Iyzico"));
builder.Services.AddHttpClient("Iyzico");   // ← HttpClient factory - REST için ŞART
builder.Services.AddScoped<IPaymentService, IyzicoPaymentService>();
 
//CORS Politikası
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy",
        policy => policy.WithOrigins("http://localhost:4200",
                                     "http://localhost:5048") 
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

//Swagger Yapılandırması
builder.Services.AddSwaggerWithJwt();
builder.Services.AddEndpointsApiExplorer();


// CompanyDataIsolationHanler - kontol dosyalarının üzerine eklenmeli
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<IAuthorizationHandler, CompanyDataIsolationHandler>();
builder.Services.AddAuthorization(opt => {
    opt.AddPolicy("CompanyIsolation", p =>
        p.Requirements.Add(new CompanyDataRequirement()));
});


// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Dev ortamı için false, Canlıda true yapılmalı
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey), // HATA BURADAN DÜZELTİLDİ
        ClockSkew = TimeSpan.Zero
    };

    // ⭐ Token'ı önce cookie'den al (Angular için), yoksa Authorization header'a düş (Admin Panel vs. için)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue("RentACarAuth", out var cookieToken)
                && !string.IsNullOrEmpty(cookieToken))
            {
                context.Token = cookieToken;
            }
            return Task.CompletedTask;
        }
    };
});

//Standart Response Formatı
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .SelectMany(x => x.Value!.Errors)
            .Select(x => x.ErrorMessage)
            .ToList();

        var message = string.Join(" ", errors);
        var response = ApiResponse<object>.ErrorResult(message);
        
        return new BadRequestObjectResult(response);
    };
});


var app = builder.Build();

// Swagger UI Active
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Rest API v1");
        options.RoutePrefix = string.Empty; // http://localhost:5065/ adresinden erişim için
    });
}

//app.UseHttpsRedirection();
app.UseMiddleware<GlobalExceptionHandler>();
app.UseStaticFiles(); // wwwroot klasörünü dış dünyaya açar
app.UseCors("DefaultCorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();


// Veritabanı Migration ve SeedData
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate(); // Pending migration'ları çalıştır

    // Seed InsurancePackages
    if (!db.InsurancePackages.Any())
    {
        db.InsurancePackages.AddRange(
            new InsurancePackage {
                Name = "Mini Güvence Paketi", Code = "MINI", DailyPrice = 200,
                Description = "Temel güvence ile kiralayın", DisplayOrder = 1,
                FeaturesJson = """[{"Name":"Lastik, Cam, Far, Ayna Güvencesi","IsIncluded":true},{"Name":"Süper Mini Hasar Güvencesi","IsIncluded":true},{"Name":"İhtiyari Mali Mesuliyet Güvencesi","IsIncluded":false},{"Name":"Ferdi Kaza Güvencesi","IsIncluded":false},{"Name":"Mini Hasar Güvencesi","IsIncluded":false}]"""
            },
            new InsurancePackage {
                Name = "Orta Güvence Paketi", Code = "ORTA", DailyPrice = 300,
                Description = "Dengeli koruma", DisplayOrder = 2, IsRecommended = true,
                FeaturesJson = """[{"Name":"Lastik, Cam, Far, Ayna Güvencesi","IsIncluded":true},{"Name":"Mini Hasar Güvencesi","IsIncluded":true},{"Name":"İhtiyari Mali Mesuliyet Güvencesi","IsIncluded":true},{"Name":"Ferdi Kaza Güvencesi","IsIncluded":true},{"Name":"Süper Mini Hasar Güvencesi","IsIncluded":false}]"""
            },
            new InsurancePackage {
                Name = "Full Güvence Paketi", Code = "FULL", DailyPrice = 450,
                Description = "Tam koruma — gönül rahatlığı", DisplayOrder = 3,
                FeaturesJson = """[{"Name":"Lastik, Cam, Far, Ayna Güvencesi","IsIncluded":true},{"Name":"Süper Mini Hasar Güvencesi","IsIncluded":true},{"Name":"İhtiyari Mali Mesuliyet Güvencesi","IsIncluded":true},{"Name":"Ferdi Kaza Güvencesi","IsIncluded":true},{"Name":"Mini Hasar Güvencesi","IsIncluded":false}]"""
            }
        );

        db.AdditionalProducts.AddRange(
            new AdditionalProduct { Name = "Ek Sürücü", Code = "EXTRA_DRIVER", Description = "Aracın, kiralayan şahıs dışındaki kişi ve/veya kişilerce kullanılabilmesini sağlamaktadır.", DailyPrice = 144, IconName = "fa-user-plus", IsQuantityBased = true, MaxQuantity = 3, DisplayOrder = 1 },
            new AdditionalProduct { Name = "Çocuk Koltuğu", Code = "CHILD_SEAT", Description = "Belirli yaş ve kilo altındaki bebekler için zorunludur.", DailyPrice = 270, IconName = "fa-baby", IsQuantityBased = true, MaxQuantity = 3, DisplayOrder = 2 },
            new AdditionalProduct { Name = "Genç Sürücü", Code = "YOUNG_DRIVER", Description = "Yaş sınırı uygun değilse genç sürücü paketi.", DailyPrice = 672, IconName = "fa-user-clock", IsQuantityBased = false, MaxQuantity = 1, DisplayOrder = 3 },
            new AdditionalProduct { Name = "Ek 250 Kilometre Paketi", Code = "EXTRA_KM", Description = "Kiralama süresi boyunca 250 km ilave eder.", DailyPrice = 567, IconName = "fa-road", IsQuantityBased = true, MaxQuantity = 5, DisplayOrder = 4 }
        );

        await db.SaveChangesAsync();
    }
}


app.Run();