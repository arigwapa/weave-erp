using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class RunSchedule
    {
        [Key]
        public int RunScheduleID { get; set; }

        [Required, StringLength(80)]
        public string ScheduleKey { get; set; } = string.Empty;

        public int CollectionID { get; set; }
        public int ProductID { get; set; }

        [Required, StringLength(100)]
        public string RunCode { get; set; } = string.Empty;

        [StringLength(120)]
        public string LineTeam { get; set; } = string.Empty;

        [StringLength(120)]
        public string OwnerAssignment { get; set; } = string.Empty;

        [StringLength(20)]
        public string StartDate { get; set; } = string.Empty;

        [StringLength(20)]
        public string EndDate { get; set; } = string.Empty;

        public int PlannedQty { get; set; }

        [Required, StringLength(40)]
        public string Status { get; set; } = "For Scheduling";

        [Required, StringLength(20)]
        public string Source { get; set; } = "Queue";

        [StringLength(80)]
        public string CollectionCode { get; set; } = string.Empty;

        [StringLength(180)]
        public string CollectionName { get; set; } = string.Empty;

        [StringLength(80)]
        public string ProductSKU { get; set; } = string.Empty;

        [StringLength(180)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(80)]
        public string? LinkedVersion { get; set; }

        public string SizePlanJson { get; set; } = "{}";

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
