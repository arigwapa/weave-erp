using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BranchDto
    {
        [Required(ErrorMessage = "Branch name is required.")]
        [StringLength(100, ErrorMessage = "Branch name must be at most 100 characters.")]
        public string BranchName { get; set; } = string.Empty;

        [StringLength(255, ErrorMessage = "Address must be at most 255 characters.")]
        public string? Address { get; set; }

        [Range(0, 100, ErrorMessage = "Capacity must be between 0 and 100.")]
        public int Capacity { get; set; }

        public int? WarehouseManagerUserID { get; set; }
    }
}
