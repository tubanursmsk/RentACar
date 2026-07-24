 
using System.ComponentModel.DataAnnotations;
 
namespace RentACar.Application.DTOs.Auth;
 
public class ForgotPasswordDto
{
    [Required(ErrorMessage = "E-posta adresi zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
    public string Email { get; set; } = string.Empty;
}
 