using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Auth
{
    public class RegisterDto
    {
        [Required] public string FirstName { get; set; } = string.Empty;
        [Required] public string LastName { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
        
        // Araç kiralama özel alanları eklenebilir (Personel telefonu vb.)
        public string Phone { get; set; } = string.Empty;
    }
}