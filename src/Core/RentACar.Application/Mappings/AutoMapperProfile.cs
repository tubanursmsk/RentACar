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
using RentACar.Application.DTOs.Customer;

namespace RentACar.Application.Mappings;

public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        // ═══════════════════════════════════════════════════
        // AUTH / REGISTER MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<RegisterDto, User>();
        CreateMap<RegisterCompanyDto, User>();
        CreateMap<LoginDto, User>();
        CreateMap<User, AuthResponseDto>();

        // ═══════════════════════════════════════════════════
        // USER MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<User, UserDto>().ReverseMap()
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address));
        CreateMap<User, UserUpdateDto>().ReverseMap();

        // ═══════════════════════════════════════════════════
        // CUSTOMER MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<Customer, CustomerDto>()
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src =>
                src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : string.Empty));

        // ═══════════════════════════════════════════════════
        // BRAND MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<Brand, BrandDto>().ReverseMap();
        CreateMap<BrandCreateDto, Brand>();
        CreateMap<BrandUpdateDto, Brand>();

        // ═══════════════════════════════════════════════════
        // LOCATION MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<Location, LocationDto>().ReverseMap();
        CreateMap<LocationCreateDto, Location>();
        CreateMap<LocationUpdateDto, Location>();

        // ═══════════════════════════════════════════════════
        // CAR MAPPINGS
        // ═══════════════════════════════════════════════════

        // ⭐ CarImage → CarImageDto mapping (YENİ)
        CreateMap<CarImage, CarImageDto>();

        // Car → CarDto
        CreateMap<Car, CarDto>()
            .ForMember(dest => dest.BrandName,
                opt => opt.MapFrom(src => src.Brand != null ? src.Brand.Name : string.Empty))
            .ForMember(dest => dest.CurrentLocationName,
                opt => opt.MapFrom(src => src.CurrentLocation != null ? src.CurrentLocation.Name : string.Empty))
            // ⭐ CarImages artık List<CarImageDto> — silinmemiş olanları map et
            .ForMember(dest => dest.CarImages,
                opt => opt.MapFrom(src =>
                    src.CarImages != null
                        ? src.CarImages.Where(i => !i.IsDeleted).ToList()
                        : new List<CarImage>()));

        // CarCreateDto → Car
        // NOT: ImageUrl, CarImages ve dosya alanları service'te yönetiliyor
        CreateMap<CarCreateDto, Car>()
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
            .ForMember(dest => dest.CarImages, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.Brand, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentLocation, opt => opt.Ignore());

        // CarUpdateDto → Car
        // NOT: ImageUrl ve CarImages service tarafında yönetiliyor — ezilmemeli
        CreateMap<CarUpdateDto, Car>()
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
            .ForMember(dest => dest.CarImages, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.Brand, opt => opt.Ignore())
            .ForMember(dest => dest.CurrentLocation, opt => opt.Ignore());

        // ═══════════════════════════════════════════════════
        // RENTAL MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<Rental, RentalDto>()
            .ForMember(dest => dest.CarInfo, opt => opt.MapFrom(src =>
                $"{src.Car.Brand.Name} {src.Car.Model} - {src.Car.Plate}"))
            .ForMember(dest => dest.CustomerFullName, opt => opt.MapFrom(src =>
                $"{src.Customer.User!.FirstName} {src.Customer.User.LastName}"))
            .ForMember(dest => dest.PickUpLocationName,
                opt => opt.MapFrom(src => src.PickUpLocation.Name))
            .ForMember(dest => dest.DropOffLocationName,
                opt => opt.MapFrom(src => src.DropOffLocation.Name));

        CreateMap<RentalCreateDto, Rental>();

        // ═══════════════════════════════════════════════════
        // ADDITIONAL SERVICE MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<AdditionalService, AdditionalServiceDto>().ReverseMap();
        CreateMap<AdditionalServiceCreateDto, AdditionalService>();
        CreateMap<AdditionalServiceUpdateDto, AdditionalService>();

        // ═══════════════════════════════════════════════════
        // DASHBOARD MAPPINGS
        // ═══════════════════════════════════════════════════
        CreateMap<DashboardStatsDto, DashboardStatsDto>().ReverseMap();
    }
}