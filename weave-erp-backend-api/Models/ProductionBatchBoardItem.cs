using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class ProductionBatchBoardItem
    {
        [Key]
        public int BatchBoardID { get; set; }

        [Required, StringLength(80)]
        public string Code { get; set; } = string.Empty;

        public int OrderID { get; set; }

        [StringLength(50)]
        public string VersionNumber { get; set; } = string.Empty;

        public int ProductID { get; set; }
        public int CollectionID { get; set; }

        [StringLength(80)]
        public string CollectionCode { get; set; } = string.Empty;

        [StringLength(180)]
        public string CollectionName { get; set; } = string.Empty;

        [StringLength(80)]
        public string ProductSKU { get; set; } = string.Empty;

        [StringLength(100)]
        public string RunCode { get; set; } = string.Empty;

        [StringLength(80)]
        public string ScheduleKey { get; set; } = string.Empty;

        [StringLength(40)]
        public string SourceStatus { get; set; } = string.Empty;

        [StringLength(160)]
        public string Product { get; set; } = string.Empty;

        [StringLength(50)]
        public string Version { get; set; } = string.Empty;

        [StringLength(20)]
        public string Size { get; set; } = string.Empty;

        public int Qty { get; set; }

        [Required, StringLength(40)]
        public string Status { get; set; } = "In Progress";

        [StringLength(40)]
        public string QAStatus { get; set; } = "Pending";

        public int? QAStartedByUserID { get; set; }
        public DateTime? QAStartedAt { get; set; }

        [StringLength(1000)]
        public string? HandoffNotes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
