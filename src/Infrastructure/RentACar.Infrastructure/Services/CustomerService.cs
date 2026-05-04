using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentACar.Application.DTOs.Customer;
using RentACar.Application.DTOs.Responses;
using RentACar.Application.Interfaces;
using RentACar.Domain.Entities;

namespace RentACar.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CustomerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ApiResponse<IEnumerable<CustomerDto>>> GetAllCustomersAsync()
    {
        // FullName eşleştirmesi için User tablosunu dahil (Include) etmemiz şart!
        var customers = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => !c.IsDeleted)
            .Include(c => c.User) 
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<CustomerDto>>(customers);
        return ApiResponse<IEnumerable<CustomerDto>>.SuccessResult(dtos);
    }

    public async Task<ApiResponse<CustomerDto>> GetCustomerByIdAsync(int id)
    {
        var customer = await _unitOfWork.Repository<Customer>()
            .GetWhere(c => c.Id == id && !c.IsDeleted)
            .Include(c => c.User)
            .FirstOrDefaultAsync();

        if (customer == null) return ApiResponse<CustomerDto>.ErrorResult("Müşteri bulunamadı.");

        return ApiResponse<CustomerDto>.SuccessResult(_mapper.Map<CustomerDto>(customer));
    }

    
    public async Task<ApiResponse<bool>> UpdateCustomerAsync(int id, CustomerUpdateDto dto)
    {
        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(id);
        
        if (customer == null || customer.IsDeleted) 
            return ApiResponse<bool>.ErrorResult("Müşteri bulunamadı.");

        // Müşteriye ait bilgileri DTO'dan gelen verilerle güncelliyoruz
        customer.IdentityNumber = dto.IdentityNumber;
        customer.Phone = dto.Phone;
        customer.DateOfBirth = dto.DateOfBirth;
        customer.FindeksScore = dto.FindeksScore;
        customer.UpdatedDate = DateTime.UtcNow;

        _unitOfWork.Repository<Customer>().Update(customer);
        await _unitOfWork.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResult(true, "Müşteri bilgileri başarıyla güncellendi.");
    }
}