using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Product
    {
        [Key]
        public int ProductID { get; set; }
        [Required, StringLength(80)]
        public string SKU { get; set; } = string.Empty;
        [Required, StringLength(180)]
        public string Name { get; set; } = string.Empty;
        [Required, StringLength(80)]
        public string Category { get; set; } = string.Empty;
        [StringLength(500)]
        public string? ImageUrl { get; set; }
        [Required]
        public string DesignNotes { get; set; } = string.Empty;
        [Required]
        public string ManufacturingInstructions { get; set; } = string.Empty;
        [Required]
        public string SizeProfile { get; set; } = "{}";
        [Required, StringLength(80)]
        public string Season { get; set; } = string.Empty;
        [Range(1, 1000000)]
        public int Quantity { get; set; } = 1;
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        [StringLength(40)]
        public string? ApprovalStatus { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
