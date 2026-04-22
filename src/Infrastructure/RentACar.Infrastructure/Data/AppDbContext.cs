using Microsoft.EntityFrameworkCore;
using RentACar.Domain.Entities;
using RentACar.Domain.Models;

namespace RentACar.Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Car> Cars { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Rental> Rentals { get; set; }
    public DbSet<Location> Locations { get; set; }
    public DbSet<AdditionalService> AdditionalServices { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Car - DailyPrice için
        modelBuilder.Entity<Car>()
            .Property(c => c.DailyPrice)
            .HasColumnType("decimal(18,2)");

        // AdditionalService - DailyPrice için
        modelBuilder.Entity<AdditionalService>()
            .Property(aserv => aserv.DailyPrice)
            .HasColumnType("decimal(18,2)");

        // Rental - TotalAmount için
        modelBuilder.Entity<Rental>()
            .Property(r => r.TotalAmount)
            .HasColumnType("decimal(18,2)");

        // --- CASCADE PATH HATASI ÇÖZÜMÜ ---

        // Rental -> PickUpLocation İlişkisi
        modelBuilder.Entity<Rental>()
            .HasOne(r => r.PickUpLocation)
            .WithMany()
            .HasForeignKey(r => r.PickUpLocationId)
            .OnDelete(DeleteBehavior.Restrict); // Cascade yerine Restrict kullanıyoruz

        // Rental -> DropOffLocation İlişkisi
        modelBuilder.Entity<Rental>()
            .HasOne(r => r.DropOffLocation)
            .WithMany()
            .HasForeignKey(r => r.DropOffLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Car -> CurrentLocation İlişkisi 
        modelBuilder.Entity<Car>()
            .HasOne(c => c.CurrentLocation)
            .WithMany()
            .HasForeignKey(c => c.CurrentLocationId)
            .OnDelete(DeleteBehavior.Restrict);

        // Tüm Entity'lerdeki DateTime alanlarını Türkiye saatine (UTC+3) göre ayarla
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var properties = entityType.ClrType.GetProperties()
                .Where(p => p.PropertyType == typeof(DateTime) || p.PropertyType == typeof(DateTime?));

            foreach (var property in properties)
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property(property.Name)
                    .HasDefaultValueSql("DATEADD(HOUR, 3, GETUTCDATE())");
            }
        }
    }


}