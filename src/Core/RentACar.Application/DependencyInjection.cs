using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace RentACar.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // AutoMapper v13+ kullanımı
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        // Diğer kurgular (FluentValidation vb.) buraya gelecek
        
        return services;
    }
}