namespace RentACar.Application.DTOs.AdditionalProducts;

public class AdditionalProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DailyPrice { get; set; }
    public string IconName { get; set; } = string.Empty;
    public bool IsQuantityBased { get; set; }
    public int MaxQuantity { get; set; }
    public int DisplayOrder { get; set; }
}
