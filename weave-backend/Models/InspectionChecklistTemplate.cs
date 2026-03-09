using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class InspectionChecklistTemplate
    {
        [Key]
        public int ChecklistTemplateID { get; set; }

        [Required, StringLength(50)]
        public string ChecklistCode { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string ChecklistName { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Category { get; set; } = string.Empty;

        public int SequenceNo { get; set; }
        public bool IsRequired { get; set; }
        public bool IsActive { get; set; } = true;
        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
