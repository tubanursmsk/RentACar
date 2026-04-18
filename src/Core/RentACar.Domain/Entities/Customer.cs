namespace RentACar.Domain.Entities
{
    public class Customer : BaseEntity
    {
        public int UserId { get; set; } // Identity User ile bağlanacak
        public User? User { get; set; }
        public string IdentityNumber { get; set; } = string.Empty; // TC Kimlik No
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        
        // Araç kiralama için kritik iş kuralı
        public int FindeksScore { get; set; } = 0; 
    }
}