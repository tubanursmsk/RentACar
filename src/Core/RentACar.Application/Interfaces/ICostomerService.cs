using RentACar.Application.DTOs.Customer;
using RentACar.Application.DTOs.Responses;

namespace RentACar.Application.Interfaces;

public interface ICustomerService
{
    Task<ApiResponse<IEnumerable<CustomerDto>>> GetAllCustomersAsync();
    Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(int id);
}