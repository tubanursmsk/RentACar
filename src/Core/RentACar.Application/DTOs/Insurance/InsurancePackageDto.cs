namespace RentACar.Application.DTOs.Insurance;

public class InsurancePackageDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public string Description { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsRecommended { get; set; }
    public List<InsuranceFeatureDto> Features { get; set; } = new();
}

public class InsuranceFeatureDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsIncluded { get; set; }
}
