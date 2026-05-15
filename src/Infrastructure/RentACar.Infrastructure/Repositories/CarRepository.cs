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

    // FİLTRELEME MANTIĞI BURAYA EKLENDİ
    public async Task<(IEnumerable<Car> Items, int TotalCount)> GetPagedWithDetailsAsync(
        int pageNumber, int pageSize, 
        int? locationId = null, int? fuelType = null, int? transmissionType = null, 
        decimal? minPrice = null, decimal? maxPrice = null, string? searchTerm = null, List<int>? brandIds = null)
    {
        var query = _context.Set<Car>().Where(c => !c.IsDeleted);

        // Dinamik Sorgu (Sadece dolu olan filtreler Where şartına eklenir)
        if (locationId.HasValue) query = query.Where(c => c.CurrentLocationId == locationId.Value);
        if (fuelType.HasValue) query = query.Where(c => (int)c.FuelType == fuelType.Value);
        if (transmissionType.HasValue) query = query.Where(c => (int)c.TransmissionType == transmissionType.Value);
        if (minPrice.HasValue) query = query.Where(c => c.DailyPrice >= minPrice.Value);
        if (maxPrice.HasValue) query = query.Where(c => c.DailyPrice <= maxPrice.Value);
        
        if (brandIds != null && brandIds.Any()) 
            query = query.Where(c => brandIds.Contains(c.BrandId));
            
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(c => c.Brand.Name.ToLower().Contains(term) || c.Model.ToLower().Contains(term));
        }

        query = query
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