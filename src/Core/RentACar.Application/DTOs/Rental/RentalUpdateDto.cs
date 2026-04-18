namespace RentACar.Application.DTOs.Rental
{
    public class RentalUpdateDto
    {
        public int CarId { get; set; }
        public int UserId { get; set; } // Şimdilik elle gireceğiz, Identity kurulunca Token'dan alacağız
        public DateTime RentStartDate { get; set; }
        public DateTime RentEndDate { get; set; }
    }
}