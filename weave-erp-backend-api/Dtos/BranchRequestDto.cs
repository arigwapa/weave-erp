using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BranchRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Branch ID must be greater than 0.")]
        public int BranchID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Region ID must be greater than 0.")]
        public int RegionID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Requested-by user ID must be greater than 0.")]
        public int RequestedByUserID { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;
    }
}
