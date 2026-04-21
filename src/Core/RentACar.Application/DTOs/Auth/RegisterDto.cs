using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Auth
{public class RegisterDto
{
    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad alanı zorunludur.")]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta adresi zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
        ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
    public string Password { get; set; } = string.Empty;
        
        // Araç kiralama özel alanları eklenebilir (Personel telefonu vb.)
        public string Phone { get; set; } = string.Empty;
    }
}