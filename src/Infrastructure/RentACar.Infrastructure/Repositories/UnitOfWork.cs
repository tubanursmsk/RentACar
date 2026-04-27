using RentACar.Application.Interfaces;
using RentACar.Infrastructure.Context;

namespace RentACar.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    
    // Doğru tanımlama ve başlatma
    private readonly Dictionary<string, object> _repositories = new();

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    public IGenericRepository<T> Repository<T>() where T : class
    {
        // Artık _repositories null olamayacağı için if (_repositories == null) kontrolünü sildik (CS0191 Çözümü)

        var type = typeof(T).Name;

        if (!_repositories.ContainsKey(type))
        {
            var repositoryType = typeof(GenericRepository<>);
            
            // Activator null dönerse diye null-coalescing (??) operatörü ekledik (CS8604 Çözümü)
            var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(T)), _context) 
                                     ?? throw new InvalidOperationException($"'{type}' için repository oluşturulamadı.");
            
            _repositories.Add(type, repositoryInstance);
        }

        return (IGenericRepository<T>)_repositories[type];
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}