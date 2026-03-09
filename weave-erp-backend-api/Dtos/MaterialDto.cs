using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class MaterialDto
    {
        [Required(ErrorMessage = "Material name is required.")]
        [StringLength(180, ErrorMessage = "Material name must be at most 180 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Material type is required.")]
        [StringLength(80, ErrorMessage = "Material type must be at most 80 characters.")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Unit is required.")]
        [StringLength(20, ErrorMessage = "Unit must be at most 20 characters.")]
        public string Unit { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Unit cost must be 0 or greater.")]
        public decimal UnitCost { get; set; }

        [StringLength(160, ErrorMessage = "Supplier name must be at most 160 characters.")]
        public string? SupplierName { get; set; }

        [StringLength(1000, ErrorMessage = "Notes must be at most 1000 characters.")]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;
    }
}
