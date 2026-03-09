using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class InspectionChecklistResult
    {
        [Key]
        public int ChecklistResultID { get; set; }
        public int InspectionID { get; set; }
        public int ChecklistTemplateID { get; set; }

        [Required, StringLength(20)]
        public string ChecklistStatus { get; set; } = "Pass";

        [StringLength(255)]
        public string? Remarks { get; set; }

        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
