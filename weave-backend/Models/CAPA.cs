using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class CAPA
    {
        [Key]
        public int CAPAID { get; set; }
        public int InspectionID { get; set; }

        [Required, StringLength(150)]
        public string IssueTitle { get; set; } = string.Empty;

        [StringLength(255)]
        public string? RootCause { get; set; }

        [StringLength(255)]
        public string? CorrectiveAction { get; set; }

        [StringLength(255)]
        public string? PreventiveAction { get; set; }

        [StringLength(100)]
        public string? ResponsibleDepartment { get; set; }

        public int? ResponsibleUserID { get; set; }
        public DateTime? DueDate { get; set; }

        [Required, StringLength(30)]
        public string Status { get; set; } = "Open";

        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
