using System.ComponentModel.DataAnnotations;

namespace RentACar.Application.DTOs.Rental;

public class CancelReservationDto
{
    /// <summary>
    /// İptal sebebi — opsiyonel, kullanıcı boş bırakabilir.
    /// </summary>
    [MaxLength(500, ErrorMessage = "İptal sebebi 500 karakteri geçemez.")]
    public string? Reason { get; set; }
}
