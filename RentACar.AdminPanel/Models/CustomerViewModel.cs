using RentACar.Application.DTOs.Customer;
using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class CustomerListViewModel
{
    // API'deki "All" endpoint'ini kullandığımız için direkt liste tutuyoruz
    public List<CustomerDto> Customers { get; set; } = new();
}

public class CustomerUpdateViewModel
{
    public int Id { get; set; }
    public int UserId { get; set; }

    // Ekranda bilgi amaçlı göstereceğimiz için sadece okunur (readonly) yapacağız
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "TC Kimlik Numarası zorunludur.")]
    [StringLength(11, MinimumLength = 11, ErrorMessage = "TC Kimlik No 11 haneli olmalıdır.")]
    public string IdentityNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefon numarası zorunludur.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Doğum tarihi zorunludur.")]
    public DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = "Findeks Puanı zorunludur.")]
    [Range(0, 1900, ErrorMessage = "Findeks puanı 0 ile 1900 arasında olmalıdır.")]
    public int FindeksScore { get; set; }
}