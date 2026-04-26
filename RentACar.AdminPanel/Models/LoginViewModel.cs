using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class LoginViewModel
{
    [Required(ErrorMessage = "Email veya Kullanıcı Adı zorunludur.")]
    public string EmailOrUserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; }
}