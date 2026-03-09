using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class ProductVersionDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Product ID must be greater than 0.")]
        public int ProductID { get; set; }

        [Required(ErrorMessage = "Version number is required.")]
        [StringLength(50, ErrorMessage = "Version number must be at most 50 characters.")]
        public string VersionNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Approval status is required.")]
        [StringLength(40, ErrorMessage = "Approval status must be at most 40 characters.")]
        public string ApprovalStatus { get; set; } = string.Empty;
    }
}
