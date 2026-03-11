using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class AuditViewer
    {
        [Key]
        public int EventID { get; set; }

        public DateTime DatePerformed { get; set; } = DateTime.UtcNow;

        [Required]
        [StringLength(160)]
        public string Actor { get; set; } = string.Empty;

        [Required]
        [StringLength(120)]
        public string Role { get; set; } = string.Empty;

        [Required]
        [StringLength(120)]
        public string Module { get; set; } = string.Empty;

        [Required]
        [StringLength(180)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [StringLength(300)]
        public string? IpAgent { get; set; }
    }
}
