using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Auth
{
    public class RegisterCompanyDto
    {
        // Şirket Bilgileri
        [Required] public string CompanyName { get; set; } = string.Empty;
        [Required] public string TaxNumber { get; set; } = string.Empty;
        [Required] public string Phone { get; set; } = string.Empty;
        [Required] public string FullAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;

        // Yönetici (User) Bilgileri
        [Required] public string FirstName { get; set; } = string.Empty;
        [Required] public string LastName { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
    }
}