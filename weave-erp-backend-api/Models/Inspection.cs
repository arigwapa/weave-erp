using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Inspection
    {
        [Key]
        public int InspectionID { get; set; }
        public int BatchBoardID { get; set; }
        public int UserID { get; set; }
        [Required, StringLength(40)]
        public string AQLLevel { get; set; } = string.Empty;
        [Required, StringLength(40)]
        public string InspectionLevel { get; set; } = string.Empty;
        public int SampleSize { get; set; }
        public int DefectsFound { get; set; }
        public int AcceptThreshold { get; set; }
        public int RejectThreshold { get; set; }
        [Required, StringLength(40)]
        public string Result { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime InspectionDate { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
