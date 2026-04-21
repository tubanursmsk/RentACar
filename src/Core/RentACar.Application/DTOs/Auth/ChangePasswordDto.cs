using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Auth
{
    public class ChangePasswordDto
    {
        public int UserId { get; set; }
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$",
        ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
        public string NewPassword { get; set; } = string.Empty;
    }
}