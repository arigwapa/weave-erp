using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class RolePermissionChangeRequest
    {
        [Key]
        public int RequestID { get; set; }
        public int RoleID { get; set; }
        public int? BranchID { get; set; }
        public int RequestedByUserID { get; set; }
        public DateTime RequestedAt { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public int? ReviewedByUserID { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? Notes { get; set; }
        [Required]
        public string PayloadJSON { get; set; } = string.Empty;
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
