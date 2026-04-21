using AutoMapper;
using RentACar.Domain.Entities;
using RentACar.Application.DTOs.Auth;
using RentACar.Application.DTOs.User;
using RentACar.Application.DTOs;

namespace RentACar.Application.Mappings;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        // Auth / User Mappings
        CreateMap<RegisterDto, User>();
        CreateMap<RegisterCompanyDto, User>();
        CreateMap<LoginDto, User>();
        CreateMap<User, AuthResponseDto>();
        CreateMap<User, UserDto>().ReverseMap();
        
        // Diğer Entityler (Car, Brand vb.) eklendikçe buraya mappingleri ekleyeceğiz.
    }
}