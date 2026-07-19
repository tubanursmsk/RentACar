using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.User;

public class ChangePasswordDto
{
    public int UserId { get; set; } 

    [Required(ErrorMessage = "Mevcut şifre zorunludur.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre zorunludur.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Şifre en az 6 karakter olmalı.")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre onayı zorunludur.")]
    [Compare(nameof(NewPassword), ErrorMessage = "Şifreler eşleşmiyor.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
