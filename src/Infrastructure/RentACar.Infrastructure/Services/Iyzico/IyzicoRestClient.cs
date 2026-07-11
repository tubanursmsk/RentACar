using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace RentACar.Infrastructure.Services.Iyzico;

/// <summary>
/// Iyzico REST API'sine HTTP çağrılarını yapan alt seviye client.
/// IYZWSv2 auth protokolünü implement eder (HMAC-SHA256 imzalı).
/// </summary>
public class IyzicoRestClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _secretKey;
    private readonly string _baseUrl;
    private readonly ILogger<IyzicoRestClient> _logger;

    // camelCase serialization — Iyzico'nun beklediği format
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false
    };

    public IyzicoRestClient(
        HttpClient httpClient,
        string apiKey,
        string secretKey,
        string baseUrl,
        ILogger<IyzicoRestClient> logger)
    {
        _httpClient = httpClient;
        _apiKey = apiKey;
        _secretKey = secretKey;
        _baseUrl = baseUrl.TrimEnd('/');
        _logger = logger;
    }

    /// <summary>
    /// Iyzico'ya POST isteği gönderir. Auth header'ı hazırlar.
    /// </summary>
    /// <typeparam name="TResponse">Beklenen response tipi</typeparam>
    /// <param name="uriPath">Endpoint path (örn: "/payment/3dsecure/initialize")</param>
    /// <param name="requestBody">Request payload objesi</param>
    /// <returns>Deserialize edilmiş response</returns>
    public async Task<TResponse?> PostAsync<TResponse>(string uriPath, object requestBody)
        where TResponse : class
    {
        // ── 1. Payload JSON'a çevir ──
        var payloadJson = JsonSerializer.Serialize(requestBody, JsonOpts);

        // ── 2. Random key üret (nonce - her istekte farklı) ──
        var randomKey = GenerateRandomKey();

        // ── 3. Signature üret ──
        // signature = HMAC-SHA256(secretKey, randomKey + uriPath + payloadJson).hex.toLowerCase
        var signaturePayload = randomKey + uriPath + payloadJson;
        var signature = ComputeHmacSha256Hex(_secretKey, signaturePayload);

        // ── 4. Authorization header string'i ──
        // "apiKey:xxx&randomKey:yyy&signature:zzz" formatında
        var authString = $"apiKey:{_apiKey}&randomKey:{randomKey}&signature:{signature}";
        var authBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(authString));

        // ── 5. HTTP Request hazırla ──
        var url = _baseUrl + uriPath;
        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(payloadJson, Encoding.UTF8, "application/json")
        };

        request.Headers.Add("Authorization", $"IYZWSv2 {authBase64}");
        request.Headers.Add("x-iyzi-rnd", randomKey);
        request.Headers.Add("Accept", "application/json");

        // ── 6. Çağrıyı yap ──
        try
        {
            _logger.LogInformation("Iyzico API çağrısı: {Uri}", uriPath);

            using var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Iyzico HTTP hatası: {Status} - {Body}",
                    response.StatusCode, responseBody);
            }

            if (string.IsNullOrWhiteSpace(responseBody))
                return null;

            return JsonSerializer.Deserialize<TResponse>(responseBody, JsonOpts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Iyzico API çağrısı başarısız: {Uri}", uriPath);
            throw;
        }
    }

    private static string GenerateRandomKey()
    {
        // Timestamp + random - her istekte farklı olmalı
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        var random = Random.Shared.Next(100000, 999999);
        return $"{timestamp}{random}";
    }

    private static string ComputeHmacSha256Hex(string key, string message)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var messageBytes = Encoding.UTF8.GetBytes(message);

        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(messageBytes);

        // Hex string olarak döndür (lowercase)
        var sb = new StringBuilder(hashBytes.Length * 2);
        foreach (var b in hashBytes)
            sb.Append(b.ToString("x2"));

        return sb.ToString();
    }
}
