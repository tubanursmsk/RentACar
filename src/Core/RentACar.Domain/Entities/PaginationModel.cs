namespace RentACar.Domain.Models;

public class PaginationModel<T>
{
    public IReadOnlyList<T> Items { get; set; }
    public int TotalCount { get; set; }
}