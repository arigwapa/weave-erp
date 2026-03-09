using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Material
    {
        [Key]
        public int MaterialID { get; set; }
        [Required, StringLength(180)]
        public string Name { get; set; } = string.Empty;
        [Required, StringLength(80)]
        public string Type { get; set; } = string.Empty;
        [Required, StringLength(20)]
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
        [StringLength(160)]
        public string? SupplierName { get; set; }
        [StringLength(1000)]
        public string? Notes { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
