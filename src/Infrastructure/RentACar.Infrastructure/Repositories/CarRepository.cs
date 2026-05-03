using Microsoft.EntityFrameworkCore;
using RentACar.Domain.Entities;
using RentACar.Domain.Interfaces;
using RentACar.Infrastructure.Context;

namespace RentACar.Infrastructure.Repositories;

public class CarRepository : GenericRepository<Car>, ICarRepository
{
    private new readonly AppDbContext _context;

    public CarRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Car>> GetAllWithDetailsAsync()
    {
        return await _context.Set<Car>()
            .Where(c => !c.IsDeleted)
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation)
            .Include(c => c.CarImages)
            .ToListAsync();
    }

    public async Task<Car?> GetByIdWithImagesAsync(int id)
    {
        return await _context.Set<Car>()
            .Where(c => !c.IsDeleted)
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation)
            .Include(c => c.CarImages)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<(IEnumerable<Car> Items, int TotalCount)> GetPagedWithDetailsAsync(int pageNumber, int pageSize)
    {
        var query = _context.Set<Car>()
            .Where(c => !c.IsDeleted)
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation)
            .Include(c => c.CarImages)
            .OrderByDescending(c => c.CreatedDate);

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }
}