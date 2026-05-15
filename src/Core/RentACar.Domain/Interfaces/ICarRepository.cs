using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Domain.Interfaces;

public interface ICarRepository : IGenericRepository<Car>
{
    Task<Car?> GetByIdWithImagesAsync(int id);
    Task<IEnumerable<Car>> GetAllWithDetailsAsync();
    
    // YENİ FİLTRE PARAMETRELERİ EKLENDİ
    Task<(IEnumerable<Car> Items, int TotalCount)> GetPagedWithDetailsAsync(
        int pageNumber, int pageSize, 
        int? locationId = null, 
        int? fuelType = null, 
        int? transmissionType = null, 
        decimal? minPrice = null, 
        decimal? maxPrice = null, 
        string? searchTerm = null, 
        List<int>? brandIds = null);
}