using System.Security.Claims;

namespace RentACar.Application.Helpers
{
    public interface IJwtTokenHelper
    {
        string GenerateToken(int userId, string email, string fullName, int companyId, List<string> roles, int expireMinutes = 1440);
        ClaimsPrincipal? ValidateToken(string token);
        bool IsExpired(string token);
    }
}