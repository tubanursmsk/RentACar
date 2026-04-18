namespace RentACar.Application.DTOs.Customer
{
    public class CustomerDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string IdentityNumber { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public int FindeksScore { get; set; }
    }
}