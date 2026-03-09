using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class FinanceSubmissionAdminCollectionDto
    {
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string PackageID { get; set; } = string.Empty;
        public decimal TotalBomCost { get; set; }
        public decimal RecommendedBudget { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public string Feedback { get; set; } = string.Empty;
        public string FeedbackDetail { get; set; } = string.Empty;
        public bool SentToProductManager { get; set; }
        public bool SentToProductionManager { get; set; }
    }

    public class SubmitFinancePackageToAdminRequest
    {
        [Range(0.01, 9999999999, ErrorMessage = "Recommended budget must be greater than zero.")]
        public decimal RecommendedBudget { get; set; }

        [StringLength(1000, ErrorMessage = "Notes / Justification must be at most 1000 characters.")]
        public string? Notes { get; set; }
    }
}
