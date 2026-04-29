using Microsoft.AspNetCore.Http;
using RentACar.Application.DTOs.Car;
using RentACar.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace RentACar.AdminPanel.Models;

public class CarListViewModel
{
    public PagedResult<RentACar.Application.DTOs.Car.CarDto> Cars { get; set; } = new();
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}