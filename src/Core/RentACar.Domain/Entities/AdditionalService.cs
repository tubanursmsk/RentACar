namespace RentACar.Domain.Entities
{
    public class AdditionalService : BaseEntity // Araç kiralama sırasında müşterinin seçebileceği ek hizmetler için
    {
        public string Name { get; set; } = string.Empty; // Örn: Bebek Koltuğu, Navigasyon, Mini Hasar Sigortası
        public decimal DailyPrice { get; set; }

        // Hangi araç segmentleri için geçerli?
        // Örn: "All", "Economy", "Luxury", "UltraLuxury"
        public string CarSegment { get; set; } = "All";
    }
}