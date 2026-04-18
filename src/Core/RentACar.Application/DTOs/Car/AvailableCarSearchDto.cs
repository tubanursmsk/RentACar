namespace RentACar.Application.DTOs.Car
{
    public class AvailableCarSearchDto
    {
        public int PickUpLocationId { get; set; } // Alış Şubesi
        public DateTime PickUpDate { get; set; }  // Alış Tarihi
        public DateTime DropOffDate { get; set; } // Dönüş Tarihi
        
        // Sayfalama (Pagination) Parametreleri
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}