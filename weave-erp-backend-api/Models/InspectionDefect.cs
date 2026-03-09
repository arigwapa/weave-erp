using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class InspectionDefect
    {
        [Key]
        public int InspectionDefectID { get; set; }
        public int InspectionID { get; set; }

        [Required, StringLength(20)]
        public string DefectType { get; set; } = "Minor";

        [Required, StringLength(100)]
        public string DefectCategory { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string DefectDescription { get; set; } = string.Empty;

        public int AffectedQuantity { get; set; }
        public int? SeverityScore { get; set; }

        [StringLength(255)]
        public string? Remarks { get; set; }

        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
