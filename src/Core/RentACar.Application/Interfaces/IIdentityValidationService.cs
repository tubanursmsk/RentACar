namespace RentACar.Application.Interfaces;

public interface IIdentityValidationService
{
    // Task<bool> dönüyor çünkü gerçek bir sunucuya bağlanacağız
    Task<bool> ValidateTcKimlikNoAsync(string tcKimlikNo, string firstName, string lastName, int birthYear);
}