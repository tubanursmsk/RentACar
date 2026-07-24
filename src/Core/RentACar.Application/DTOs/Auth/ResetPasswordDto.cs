
using System.ComponentModel.DataAnnotations;
 
namespace RentACar.Application.DTOs.Auth;
 
public class ResetPasswordDto
{
    [Required(ErrorMessage = "Token zorunludur.")]
    public string Token { get; set; } = string.Empty;
 
    [Required(ErrorMessage = "Yeni şifre zorunludur.")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
    public string NewPassword { get; set; } = string.Empty;
}