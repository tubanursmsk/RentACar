using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.User;

/// <summary>
/// Kullanıcı profil güncelleme DTO'su.
/// Email değiştirilemez (güvenlik). Id JWT'den alınır.
/// </summary>
public class UserUpdateDto
{
    // Id: Controller JWT'den set eder, DTO'da tutuyoruz ama zorunlu değil
    public int Id { get; set; }

    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    [MaxLength(50, ErrorMessage = "Ad en fazla 50 karakter olabilir.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyadı alanı zorunludur.")]
    [MaxLength(50, ErrorMessage = "Soyad en fazla 50 karakter olabilir.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefon zorunludur.")]
    [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz.")]
    [StringLength(20, ErrorMessage = "Telefon en fazla 20 karakter olabilir.")]
    public string Phone { get; set; } = string.Empty;

    [StringLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir.")]
    public string? Address { get; set; }
    public string Email { get; set; }
}