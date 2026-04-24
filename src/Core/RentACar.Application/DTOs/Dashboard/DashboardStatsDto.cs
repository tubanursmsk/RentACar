namespace RentACar.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalCars { get; set; }
    public int ActiveRentedCars { get; set; }
    public int PendingReservations { get; set; }
    public int TotalCustomers { get; set; }

    
}