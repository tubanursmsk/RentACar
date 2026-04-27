using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Rental;
public class RentalDeleteDto
{
    [Required]
        public int Id { get; set; }

        public bool IsDeleted { get; set; } = true;
}
