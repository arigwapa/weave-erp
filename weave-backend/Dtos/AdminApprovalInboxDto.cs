using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class AdminApprovalBomLineDto
    {
        public int BOMID { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public decimal QtyRequired { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
    }

    public class AdminApprovalProductDto
    {
        public int ProductID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string SizeProfile { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;
        public decimal TotalCost { get; set; }
        public List<AdminApprovalBomLineDto> BomLines { get; set; } = new();
    }

    public class AdminApprovalFinanceItemDto
    {
        public int CollectionID { get; set; }
        public string PackageID { get; set; } = string.Empty;
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string Season { get; set; } = string.Empty;
        public string SubmittedAt { get; set; } = string.Empty;
        public string SubmittedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal TotalBomCost { get; set; }
        public decimal RecommendedBudget { get; set; }
        public decimal ContingencyPercent { get; set; }
        public string FinanceNotes { get; set; } = string.Empty;
        public string AdminDecision { get; set; } = string.Empty;
        public string AdminDecisionReason { get; set; } = string.Empty;
        public bool SentToProductManager { get; set; }
        public bool SentToProductionManager { get; set; }
        public List<AdminApprovalProductDto> Products { get; set; } = new();
    }

    public class AdminFinanceDecisionRequest
    {
        [Required(ErrorMessage = "Decision is required.")]
        [StringLength(40, ErrorMessage = "Decision must be at most 40 characters.")]
        public string Decision { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Reason must be at most 1000 characters.")]
        public string? Reason { get; set; }
    }

    public class AdminApprovalQaItemDto
    {
        public int InspectionID { get; set; }
        public int BatchBoardID { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string ProductVersion { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string InspectionDate { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public string AQLLevel { get; set; } = string.Empty;
        public string InspectionLevel { get; set; } = string.Empty;
        public int SampleSize { get; set; }
        public int DefectsFound { get; set; }
        public int AcceptThreshold { get; set; }
        public int RejectThreshold { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class AdminQaSendToInventoryRequest
    {
        public int? BinID { get; set; }
        public string? BinCode { get; set; }
        public int? BranchID { get; set; }
        public string? BranchName { get; set; }
    }
}
