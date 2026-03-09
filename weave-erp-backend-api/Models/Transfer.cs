using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Transfer
    {
        [Key]
        public int TransferID { get; set; }
        public int RequestID { get; set; }
        public int FromBinID { get; set; }
        public DateOnly ScheduledDate { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public DateTime? DeliveredAt { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
