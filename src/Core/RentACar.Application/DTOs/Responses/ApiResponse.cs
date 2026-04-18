namespace RentACar.Application.DTOs.Responses
{
    public class ApiResponse<T>
    {
        public T? Data { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;

        // Başarılı işlemler için pratik metotlar
        public static ApiResponse<T> SuccessResult(T data, string message = "İşlem başarılı.")
        {
            return new ApiResponse<T> { Data = data, Success = true, Message = message };
        }

        // Hatalı işlemler için pratik metotlar
        public static ApiResponse<T> ErrorResult(string message)
        {
            return new ApiResponse<T> { Success = false, Message = message  };
        }
    }
}