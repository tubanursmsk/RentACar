using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Domain.Interfaces;

public interface ICarRepository : IGenericRepository<Car>
{
    Task<Car?> GetByIdWithImagesAsync(int id);
    Task<IEnumerable<Car>> GetAllWithDetailsAsync();
    Task<(IEnumerable<Car> Items, int TotalCount)> GetPagedWithDetailsAsync(int pageNumber, int pageSize);
}