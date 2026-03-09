using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class ProductionQueueItemDto
    {
        public int OrderID { get; set; }
        public int? VersionID { get; set; }
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public int ProductID { get; set; }
        public string ProductSKU { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int BudgetID { get; set; }
        public string BudgetCode { get; set; } = string.Empty;
        public decimal ApprovedBudget { get; set; }
        public int PlannedQty { get; set; }
        public string QueueStatus { get; set; } = "Pending";
        public string Readiness { get; set; } = "Ready";
        public string DueDate { get; set; } = string.Empty;
        public int? CurrentVersionID { get; set; }
        public string CurrentVersionNumber { get; set; } = string.Empty;
        public string SuggestedVersionNumber { get; set; } = "Version 1";
        public string VersionNumber { get; set; } = string.Empty;
    }

    public class StartProductionRunRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Order is required.")]
        public int OrderID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Collection is required.")]
        public int CollectionID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Product is required.")]
        public int ProductID { get; set; }

        [Required(ErrorMessage = "Version is required.")]
        [StringLength(50, ErrorMessage = "Version must be at most 50 characters.")]
        public string VersionNumber { get; set; } = string.Empty;
    }
}

