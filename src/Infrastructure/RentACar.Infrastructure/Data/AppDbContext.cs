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
    public DbSet<InsurancePackage> InsurancePackages { get; set; } = null!;
    public DbSet<AdditionalProduct> AdditionalProducts { get; set; } = null!;
    public DbSet<RentalAdditionalProduct> RentalAdditionalProducts { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<PasswordReset> PasswordResets { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PasswordReset ilişkileri 
        modelBuilder.Entity<PasswordReset>()
            .HasOne(pr => pr.User)
            .WithMany()
            .HasForeignKey(pr => pr.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Token üzerinde hızlı arama için index
        modelBuilder.Entity<PasswordReset>()
            .HasIndex(pr => pr.Token)
            .IsUnique();

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

        // ── Rental - InsurancePackage ilişkisi (One-to-Many, opsiyonel) ──
        modelBuilder.Entity<Rental>()
            .HasOne(r => r.InsurancePackage)
            .WithMany(p => p.Rentals)
            .HasForeignKey(r => r.InsurancePackageId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Rental - RentalAdditionalProduct (One-to-Many) ──
        modelBuilder.Entity<RentalAdditionalProduct>()
            .HasOne(rap => rap.Rental)
            .WithMany(r => r.AdditionalProducts)
            .HasForeignKey(rap => rap.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── AdditionalProduct - RentalAdditionalProduct (One-to-Many) ──
        modelBuilder.Entity<RentalAdditionalProduct>()
            .HasOne(rap => rap.AdditionalProduct)
            .WithMany(p => p.RentalProducts)
            .HasForeignKey(rap => rap.AdditionalProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── Rental - Payment (One-to-Many) ──
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Rental)
            .WithMany(r => r.Payments)
            .HasForeignKey(p => p.RentalId)
            .OnDelete(DeleteBehavior.Cascade);

        // ── Decimal precision ──
        modelBuilder.Entity<Rental>().Property(r => r.SubTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Rental>().Property(r => r.InsuranceTotal).HasPrecision(18, 2);
        modelBuilder.Entity<Rental>().Property(r => r.AdditionalProductsTotal).HasPrecision(18, 2);
        modelBuilder.Entity<InsurancePackage>().Property(p => p.DailyPrice).HasPrecision(18, 2);
        modelBuilder.Entity<AdditionalProduct>().Property(p => p.DailyPrice).HasPrecision(18, 2);
        modelBuilder.Entity<RentalAdditionalProduct>().Property(p => p.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<RentalAdditionalProduct>().Property(p => p.TotalPrice).HasPrecision(18, 2);
        modelBuilder.Entity<Payment>().Property(p => p.Amount).HasPrecision(18, 2);

    }

}