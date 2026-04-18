using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace RentACar.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Modern AutoMapper v13 kullanımı
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        return services;
    }
}