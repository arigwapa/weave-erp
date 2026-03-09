using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }
        public int? UserID { get; set; }
        public int? RegionID { get; set; }
        [Required, StringLength(40)]
        public string Type { get; set; } = string.Empty;
        [Required]
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public int? CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
