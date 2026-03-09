using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Branch
    {
        [Key]
        public int BranchID { get; set; }

        [Required, StringLength(120)]
        public string BranchName { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Address { get; set; }

        public int Capacity { get; set; }
        public int? WarehouseManagerUserID { get; set; }
        public bool IsActive { get; set; } = true;
        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
