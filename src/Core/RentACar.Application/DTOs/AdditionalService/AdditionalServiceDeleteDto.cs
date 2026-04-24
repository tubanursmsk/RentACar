using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.AdditionalService;

public class AdditionalServiceDeleteDto
{
    [Required(ErrorMessage = "Silinecek hizmetin Id'si zorunludur.")]
    public int Id { get; set; }
    
}