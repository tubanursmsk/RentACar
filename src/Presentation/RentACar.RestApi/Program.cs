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

var builder = WebApplication.CreateBuilder(args);

//Katman Servisleri
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

//Controller ve JSON Ayarları
builder.Services.AddControllers();

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

app.Run();