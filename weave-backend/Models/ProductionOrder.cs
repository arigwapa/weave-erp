using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class ProductionOrder
    {
        [Key]
        public int OrderID { get; set; }

        [StringLength(180)]
        public string CollectionName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? VersionNumber { get; set; }

        [StringLength(2000)]
        public string Products { get; set; } = string.Empty;

        [Required, StringLength(40)]
        public string Status { get; set; } = "Pending";

        public DateOnly? DueDate { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
