using System.Text.Json.Serialization;

namespace RentACar.Application.DTOs.Responses
{
    public class PaginatedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }

        // Sadece Get'i olan property'leri JSON serileştirmesinden gizliyoruz
        // (Böylece Deserialize işlemi sırasında hata fırlatmaz)
        
        [JsonIgnore]
        public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
        
        [JsonIgnore]
        public bool HasPreviousPage => PageNumber > 1;
        
        [JsonIgnore]
        public bool HasNextPage => PageNumber < TotalPages;
    }
}