using BCrypt.Net;

namespace RentACar.Application.Helpers
{
    public static class PasswordHasher
    {
        // Şifreyi Hash'ler (Geri döndürülemez formata çevirir)
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        // Girilen şifre ile veritabanındaki Hash'li şifreyi karşılaştırır
        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
