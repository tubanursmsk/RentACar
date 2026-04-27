using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Company;

public class CompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string FullAddress { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;

      // BaseEntity
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
}