using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RentACar.Application.Helpers
{
    public class JwtTokenHelper : IJwtTokenHelper
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;

        public JwtTokenHelper(IConfiguration configuration)
        {
            var jwt = configuration.GetSection("JwtSettings");
            _secretKey = jwt["SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey eksik.");
            _issuer    = jwt["Issuer"]    ?? throw new InvalidOperationException("JwtSettings:Issuer eksik.");
            _audience  = jwt["Audience"]  ?? throw new InvalidOperationException("JwtSettings:Audience eksik.");
        }

        public string GenerateToken(int userId, string email, string fullName, int companyId, List<string> roles, int expireMinutes = 1440)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, email),
                new Claim("fullName", fullName),
                new Claim("companyId", companyId.ToString())
            };

            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _issuer,
                audience: _audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public ClaimsPrincipal? ValidateToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var key     = Encoding.UTF8.GetBytes(_secretKey);

            try
            {
                return handler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer           = true,
                    ValidateAudience         = true,
                    ValidateLifetime         = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer              = _issuer,
                    ValidAudience            = _audience,
                    IssuerSigningKey         = new SymmetricSecurityKey(key),
                    ClockSkew                = TimeSpan.Zero
                }, out _);
            }
            catch
            {
                return null;
            }
        }

        public bool IsExpired(string token)
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            return jwt.ValidTo < DateTime.UtcNow;
        }
    }
}