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
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation)
            .Include(c => c.CarImages)
            .ToListAsync();
    }

    public async Task<Car?> GetByIdWithImagesAsync(int id)
    {
        return await _context.Set<Car>()
            .Include(c => c.Brand)
            .Include(c => c.CurrentLocation)
            .Include(c => c.CarImages)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}