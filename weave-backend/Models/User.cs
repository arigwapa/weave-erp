using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace weave_erp_backend_api.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }
        public int RoleID { get; set; }
        [Required, StringLength(100)]
        public string Username { get; set; } = string.Empty;
        [Required, StringLength(160)]
        public string Fullname { get; set; } = string.Empty;
        [EmailAddress, StringLength(120)]
        public string? Email { get; set; }
        [StringLength(30)]
        public string? ContactNumber { get; set; }
        [Required, StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // UI/API convenience fields not stored in dbo.User.
        [NotMapped]
        public string? RoleName { get; set; }
        [NotMapped]
        public string? BranchName { get; set; }
        [NotMapped]
        public int? WarehouseID { get; set; }
        [NotMapped]
        public string? WarehouseName { get; set; }
    }
}
