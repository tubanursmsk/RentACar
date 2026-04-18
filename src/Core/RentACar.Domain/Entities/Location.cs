namespace RentACar.Domain.Entities
{
    public class Location : BaseEntity //şubeler için
    {
        public string Name { get; set; } = string.Empty; // Örn: İstanbul Havalimanı Şubesi
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
}