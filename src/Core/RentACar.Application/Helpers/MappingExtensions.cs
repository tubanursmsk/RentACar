using RentACar.Application.DTOs.Responses;
using RentACar.Domain.Models;

namespace RentACar.Application.Extensions;

public static class MappingExtensions
{
    public static PaginatedResult<TDestination> ToPaginatedResult<TSource, TDestination>(
        this PaginationModel<TSource> source, 
        int pageNumber, 
        int pageSize, 
        Func<TSource, TDestination> mapFunc)
    {
        return new PaginatedResult<TDestination>
        {
            Items = source.Items.Select(mapFunc).ToList(),
            TotalCount = source.TotalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}