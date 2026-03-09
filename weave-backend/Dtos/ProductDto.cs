using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class ProductDto
    {
        [Required(ErrorMessage = "SKU is required.")]
        [StringLength(80, ErrorMessage = "SKU must be at most 80 characters.")]
        public string SKU { get; set; } = string.Empty;

        [Required(ErrorMessage = "Product name is required.")]
        [StringLength(180, ErrorMessage = "Product name must be at most 180 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Category is required.")]
        [StringLength(80, ErrorMessage = "Category must be at most 80 characters.")]
        public string Category { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Image URL must be at most 500 characters.")]
        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "Design notes is required.")]
        public string DesignNotes { get; set; } = string.Empty;

        [Required(ErrorMessage = "Manufacturing instructions is required.")]
        public string ManufacturingInstructions { get; set; } = string.Empty;

        [Required(ErrorMessage = "Size profile is required.")]
        public string SizeProfile { get; set; } = "{}";

        [Required(ErrorMessage = "Season is required.")]
        [StringLength(80, ErrorMessage = "Season must be at most 80 characters.")]
        public string Season { get; set; } = string.Empty;

        [Range(1, 1000000, ErrorMessage = "Quantity must be at least 1.")]
        public int Quantity { get; set; } = 1;

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;

        [StringLength(40, ErrorMessage = "Approval status must be at most 40 characters.")]
        public string? ApprovalStatus { get; set; }
    }
}
