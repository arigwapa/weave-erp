using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Role
    {
        [Key]
        public int RoleID { get; set; }
        [Required, StringLength(120)]
        public string DisplayName { get; set; } = string.Empty;
        [Required, StringLength(80)]
        public string Scope { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
