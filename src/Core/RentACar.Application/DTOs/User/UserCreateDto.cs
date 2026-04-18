using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.User;

// Admin ekranından kullanıcı oluşturma gibi düşün
public class UserCreateDto
{
    [Required, MinLength(2)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MinLength(2)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta adresi zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", 
        ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
    public string Password { get; set; } = string.Empty; // hashlenip PasswordHash'e yazılacak

    [Required]
    public string Role { get; set; } = "Customer"; // Default olarak Customer, admin panelinden değiştirilebilir

}