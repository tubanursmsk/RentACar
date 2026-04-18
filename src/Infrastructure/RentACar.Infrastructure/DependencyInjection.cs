using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace RentACar.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // İleride buraya servisleri ekleyeceğiz
        return services;
    }
}