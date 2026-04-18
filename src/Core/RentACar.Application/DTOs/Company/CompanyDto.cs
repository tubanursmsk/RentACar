using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Company;

public class CompanyDto
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Company name is required.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone number is required.")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Full address is required.")]
    public string FullAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tax number is required.")]
    public string TaxNumber { get; set; } = string.Empty;
    

      // BaseEntity
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
}