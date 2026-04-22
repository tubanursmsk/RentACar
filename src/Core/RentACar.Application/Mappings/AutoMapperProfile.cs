using AutoMapper;
using RentACar.Domain.Entities;
using RentACar.Application.DTOs.Auth;
using RentACar.Application.DTOs.User;
using RentACar.Application.DTOs;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Car;

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

        // Brand Mappings
        CreateMap<Brand, BrandDto>().ReverseMap();
        CreateMap<BrandCreateDto, Brand>();
        CreateMap<BrandUpdateDto, Brand>();

        // Location Mappings
        CreateMap<Location, LocationDto>().ReverseMap();
        CreateMap<LocationCreateDto, Location>();
        CreateMap<LocationUpdateDto, Location>();

        // Car Mappings
        CreateMap<Car, CarDto>()
            .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand.Name))
            .ForMember(dest => dest.CurrentLocationName, opt => opt.MapFrom(src => src.CurrentLocation.Name));

        CreateMap<CarCreateDto, Car>();
        CreateMap<CarUpdateDto, Car>();
    }
}