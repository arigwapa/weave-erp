using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class InspectionAttachment
    {
        [Key]
        public int InspectionAttachmentID { get; set; }
        public int InspectionID { get; set; }

        [Required, StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string FileUrl { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string FileType { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Remarks { get; set; }

        public int? UploadedByUserID { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}
