using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RentACar.Application.Helpers
{
    public static class JwtTokenHelper
    {
        public static string GenerateToken(IConfiguration configuration, int userId, string email, string fullName, string role, int? companyId)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            // Güvenli okuma: Eğer ExpiryInMinutes bulunamazsa varsayılan 60 dakika kullan
            var expiryMinutesStr = jwtSettings["ExpiryInMinutes"];
            int expiryMinutes = !string.IsNullOrEmpty(expiryMinutesStr) ? Convert.ToInt32(expiryMinutesStr) : 60;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        new Claim(ClaimTypes.Email, email),
        new Claim(ClaimTypes.Name, fullName),
        new Claim(ClaimTypes.Role, role)
    };

            if (companyId.HasValue)
            {
                claims.Add(new Claim("CompanyId", companyId.Value.ToString()));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                NotBefore = DateTime.UtcNow, // Başlangıç zamanını açıkça belirtin
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes), // Bitiş zamanı
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = credentials
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
