namespace RentACar.Infrastructure.Configurations;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public bool UseStartTls { get; set; } = true;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "RentACar";

    // Test için: email'leri gerçekten göndermeyip loglara yazan mod
    public bool EnableInDevelopment { get; set; } = true;
}
