namespace RentACar.Domain.Entities;

public class PasswordReset : BaseEntity   // ← BaseEntity var mı kontrol et. Yoksa çıkar.
{
    public int UserId { get; set; }
    public User? User { get; set; }

    /// Kullanıcıya mail ile gönderilen token (URL'de bu kullanılır)
    public string Token { get; set; } = string.Empty;

    /// Token'ın son kullanma tarihi (oluşturulmadan +1 saat)
    public DateTime ExpiresAt { get; set; }

    /// Token kullanıldı mı? True olursa tekrar kullanılamaz.
    public bool IsUsed { get; set; } = false;

    /// Token ne zaman kullanıldı?
    public DateTime? UsedAt { get; set; }

    /// Talebi yapan IP (rate limit ve audit için)
    public string? RequestedFromIp { get; set; }
}

