namespace RentACar.Application.Interfaces;

public interface IFindeksService
{
    Task<int> GetFindeksScoreAsync(string tcKimlikNo);
}