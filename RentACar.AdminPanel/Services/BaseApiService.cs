using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using RentACar.Application.DTOs.Responses;
 
namespace RentACar.AdminPanel.Services;
 
public class BaseApiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly JsonSerializerOptions _jsonOptions;
 
    public BaseApiService(HttpClient httpClient, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
 
        _jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
 
        var baseUrl = _configuration["ApiSettings:BaseUrl"] ?? "http://localhost:5065/";
        _httpClient.BaseAddress = new Uri(baseUrl);
    }
 
    // JWT Token'ı Cookie'den okuyup Authorization header'ına ekler
    private void AddTokenToHeader()
    {
        var token = _httpContextAccessor.HttpContext?.Request.Cookies["JwtToken"];
 
        if (!string.IsNullOrEmpty(token))
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }
    }
 
    // GET — Tek nesne veya liste çekmek için
    public async Task<ApiResponse<T>?> GetAsync<T>(string endpoint)
    {
        AddTokenToHeader();
        var response = await _httpClient.GetAsync(endpoint);
 
        if (!response.IsSuccessStatusCode)
            return new ApiResponse<T> { Success = false, Message = $"API Hatası: {response.StatusCode}" };
 
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<T>>(content, _jsonOptions);
    }
 
    // POST — Yeni kayıt oluşturma (Create)
    public async Task<ApiResponse<TResponse>?> PostAsync<TRequest, TResponse>(string endpoint, TRequest dto)
    {
        AddTokenToHeader();
        var json = JsonSerializer.Serialize(dto);
        var data = new StringContent(json, Encoding.UTF8, "application/json");
 
        var response = await _httpClient.PostAsync(endpoint, data);
 
        if (!response.IsSuccessStatusCode)
            return new ApiResponse<TResponse> { Success = false, Message = $"API Hatası: {response.StatusCode}" };
 
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<TResponse>>(content, _jsonOptions);
    }
 
    // PUT — Mevcut kaydı güncelleme (Update)
    public async Task<ApiResponse<TResponse>?> PutAsync<TRequest, TResponse>(string endpoint, TRequest dto)
    {
        AddTokenToHeader();
        var json = JsonSerializer.Serialize(dto);
        var data = new StringContent(json, Encoding.UTF8, "application/json");
 
        var response = await _httpClient.PutAsync(endpoint, data);
 
        if (!response.IsSuccessStatusCode)
            return new ApiResponse<TResponse> { Success = false, Message = $"API Hatası: {response.StatusCode}" };
 
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<TResponse>>(content, _jsonOptions);
    }
 
    // DELETE — Soft delete için bool döner
    public async Task<ApiResponse<bool>?> DeleteAsync(string endpoint)
    {
        AddTokenToHeader();
        var response = await _httpClient.DeleteAsync(endpoint);
 
        if (!response.IsSuccessStatusCode)
            return new ApiResponse<bool> { Success = false, Message = $"API Hatası: {response.StatusCode}" };
 
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<bool>>(content, _jsonOptions);
    }
 
    // POST Multipart — Araç resmi gibi dosya yükleme işlemleri için
    public async Task<ApiResponse<TResponse>?> PostMultipartAsync<TResponse>(string endpoint, MultipartFormDataContent content)
    {
        AddTokenToHeader();
        var response = await _httpClient.PostAsync(endpoint, content);
 
        if (!response.IsSuccessStatusCode)
            return new ApiResponse<TResponse> { Success = false, Message = $"API Hatası: {response.StatusCode}" };
 
        var responseContent = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<TResponse>>(responseContent, _jsonOptions);
    }
 
    // PUT Multipart — Araç resmi güncelleme gibi işlemler için
    public async Task<ApiResponse<TResponse>?> PutMultipartAsync<TResponse>(string endpoint, MultipartFormDataContent content)
    {
        AddTokenToHeader();
        var response = await _httpClient.PutAsync(endpoint, content);
 
        if (!response.IsSuccessStatusCode)
            return new ApiResponse<TResponse> { Success = false, Message = $"API Hatası: {response.StatusCode}" };
 
        var responseContent = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ApiResponse<TResponse>>(responseContent, _jsonOptions);
    }
}