
using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Auth
{
    public class RegisterCustomerDto
    {
        [Required] public string FirstName { get; set; } = string.Empty;
        [Required] public string LastName { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required, MinLength(6)] public string Password { get; set; } = string.Empty;
        
        // Customer tablosu için gerekli özel alanlar
        [Required] public string IdentityNumber { get; set; } = string.Empty;
        [Required] public string PhoneNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
    }
}