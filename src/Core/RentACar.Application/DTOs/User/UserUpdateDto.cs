using System;
using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.User;

public class UserUpdateDto
{
    [Required]
    public int Id { get; set; }

    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyadı alanı zorunludur.")]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta adresi zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçersiz e-posta formatı.")]
    public string Email { get; set; } = string.Empty;
    
     [Required(ErrorMessage = "Telefon zorunludur.")]
    [Phone(ErrorMessage = "Geçerli bir telefon numarası giriniz.")]
    [StringLength(20)]
    public string Phone { get; set; } = string.Empty;
 
    [StringLength(500, ErrorMessage = "Adres en fazla 500 karakter olabilir.")]
    public string? Address { get; set; }
}

