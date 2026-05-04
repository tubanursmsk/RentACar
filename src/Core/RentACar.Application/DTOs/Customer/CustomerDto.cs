namespace RentACar.Application.DTOs.Customer
{
    public class CustomerDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string IdentityNumber { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public int FindeksScore { get; set; }

        //Rent kısmında Select box'ta müşterinin adını göstermek için
        public string FullName { get; set; } = string.Empty;
    }
}