using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class RolePermissionChangeRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Role ID must be greater than 0.")]
        public int RoleID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Requested-by user ID must be greater than 0.")]
        public int RequestedByUserID { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;

        [Required(ErrorMessage = "Payload JSON is required.")]
        public string PayloadJSON { get; set; } = string.Empty;
    }
}
