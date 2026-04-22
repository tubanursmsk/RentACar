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
        // Auth / Register Mappings
        CreateMap<RegisterDto, User>();
        CreateMap<RegisterCompanyDto, User>();
        CreateMap<LoginDto, User>();
        CreateMap<User, AuthResponseDto>();
        
        // User Profile & Update Mappings
        CreateMap<User, UserDto>().ReverseMap();
        CreateMap<User, UserUpdateDto>().ReverseMap();
    }
}