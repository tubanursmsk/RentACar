namespace RentACar.Domain.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; } // Genelde kiralama projelerinde int Id + Guid Identity tercih edilir, ancak senin e-commerce yapına sadık kalarak Guid de devam edebiliriz. Biz int üzerinden gidelim dedik ama e-commerce'deki gibi Guid istersen Id tipini değiştirmen yeterli.
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public bool IsDeleted { get; set; } = false;
    public bool Status { get; set; } = true;
}