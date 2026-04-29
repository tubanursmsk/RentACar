namespace RentACar.Domain.Models;

public class PaginationModel<T>
{
    //public IReadOnlyList<T> Items { get; set; }
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int TotalCount { get; set; }
}