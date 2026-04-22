namespace RentACar.Application.DTOs.Customer
{
    public class CustomerUpdateDto
    {
        public int UserId { get; set; } 
        public string IdentityNumber { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public int FindeksScore { get; set; }
    }
}