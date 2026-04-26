using RentACar.AdminPanel.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. MVC Controller ve View'ları ekle
builder.Services.AddControllersWithViews();

// 2. Token yönetimi için HttpContextAccessor ve Session ayarları
builder.Services.AddHttpContextAccessor();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60); // 1 Saatlik oturum
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// 3. BaseApiService'i HttpClient ile birlikte API'nin Base URL'ine bağladık
builder.Services.AddHttpClient<BaseApiService>(client =>
{
    client.BaseAddress = new Uri("https://localhost:5048/"); 
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();