using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class BranchRequest
    {
        [Key]
        public int RequestID { get; set; }
        public int BranchID { get; set; }
        public int RegionID { get; set; }
        public int RequestedByUserID { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public string? Notes { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
