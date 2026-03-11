using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class AuditLog
    {
        [Key]
        public int AuditID { get; set; }

        [Required]
        [StringLength(160)]
        public string PerformedBy { get; set; } = string.Empty;

        [StringLength(120)]
        public string? RoleName { get; set; }

        [Required]
        [StringLength(180)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Description { get; set; } = string.Empty;

        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    }
}
