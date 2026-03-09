using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Collection
    {
        [Key]
        public int CollectionID { get; set; }

        [Required, StringLength(50)]
        public string CollectionCode { get; set; } = string.Empty;

        [Required, StringLength(160)]
        public string CollectionName { get; set; } = string.Empty;

        [Required, StringLength(60)]
        public string Season { get; set; } = string.Empty;

        [Required]
        public DateTime TargetLaunchDate { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        [Required, StringLength(40)]
        public string Status { get; set; } = "Draft";

        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
