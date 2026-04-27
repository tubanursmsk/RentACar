namespace RentACar.Domain.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; }

    private static readonly TimeZoneInfo _turkeyTz =
        TimeZoneInfo.FindSystemTimeZoneById(
            OperatingSystem.IsWindows() ? "Turkey Standard Time" : "Europe/Istanbul");

    private static DateTime TurkeyTime =>
        TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, _turkeyTz);

    public DateTime CreatedDate { get; set; } = TurkeyTime;
    public DateTime? UpdatedDate { get; set; } = TurkeyTime;
    public bool IsDeleted { get; set; } = false;
}