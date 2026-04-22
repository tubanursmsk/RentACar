namespace RentACar.Domain.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; }
    
    // DateTime.UtcNow yerine Türkiye saatini hesaplayan bir property
    private static DateTime TurkeyTime => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, 
        TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time"));

    public DateTime CreatedDate { get; set; } = TurkeyTime;
    public DateTime? UpdatedDate { get; set; }
    public bool IsDeleted { get; set; } = false;
}