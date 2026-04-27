using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs;

public class AuthResponseDto //user jwt dto formatı
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}