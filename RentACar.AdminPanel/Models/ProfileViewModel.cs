using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class ProfileInfoViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyadı alanı zorunludur.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
    public string Email { get; set; } = string.Empty;
    
    public string Role { get; set; } = string.Empty;
}

public class ProfilePasswordViewModel
{
    [Required(ErrorMessage = "Mevcut şifrenizi girmelisiniz.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre zorunludur.")]
    [MinLength(6, ErrorMessage = "Şifreniz en az 6 karakter olmalıdır.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$", ErrorMessage = "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre tekrarı zorunludur.")]
    [Compare("NewPassword", ErrorMessage = "Yeni şifreler birbiriyle uyuşmuyor.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}