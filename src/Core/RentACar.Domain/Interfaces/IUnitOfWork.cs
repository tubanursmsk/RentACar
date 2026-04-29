using RentACar.Domain.Interfaces;


namespace RentACar.Application.Interfaces;
public interface IUnitOfWork : IDisposable
{
    IGenericRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync();

    // Özel Repository'ler
    ICarRepository Cars { get; }
}