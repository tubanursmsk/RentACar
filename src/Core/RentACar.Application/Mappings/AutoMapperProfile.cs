using AutoMapper;
using RentACar.Domain.Entities;
using RentACar.Application.DTOs.Auth;
using RentACar.Application.DTOs.User;
using RentACar.Application.DTOs;
using RentACar.Application.DTOs.Brand;
using RentACar.Application.DTOs.Location;
using RentACar.Application.DTOs.Car;
using RentACar.Application.DTOs.Rental;
using RentACar.Application.DTOs.AdditionalService;
using RentACar.Application.DTOs.Dashboard;

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

        // Rental Mappings
        CreateMap<Rental, RentalDto>()
            .ForMember(dest => dest.CarInfo, opt => opt.MapFrom(src => $"{src.Car.Brand.Name} {src.Car.Model} - {src.Car.Plate}"))
            .ForMember(dest => dest.CustomerFullName, opt => opt.MapFrom(src => $"{src.Customer.User.FirstName} {src.Customer.User.LastName}"))
            .ForMember(dest => dest.PickUpLocationName, opt => opt.MapFrom(src => src.PickUpLocation.Name))
            .ForMember(dest => dest.DropOffLocationName, opt => opt.MapFrom(src => src.DropOffLocation.Name));

        CreateMap<RentalCreateDto, Rental>();

        // Additional Service Mappings
        CreateMap<AdditionalService, AdditionalServiceDto>().ReverseMap();
        CreateMap<AdditionalServiceCreateDto, AdditionalService>();
        CreateMap<AdditionalServiceUpdateDto, AdditionalService>();

        // Dashboard Mappings
        CreateMap<DashboardStatsDto, DashboardStatsDto>().ReverseMap();

        
        

    }
}