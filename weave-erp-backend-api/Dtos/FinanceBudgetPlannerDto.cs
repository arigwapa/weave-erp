using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class FinanceBudgetPlannerProductDto
    {
        public int ProductID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal TotalQty { get; set; }
        public decimal TotalCost { get; set; }
    }

    public class FinanceBudgetPlannerCollectionDto
    {
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string CollectionStatus { get; set; } = string.Empty;
        public string PlannerStatus { get; set; } = "Planning Budget";
        public bool IsAdminApproved { get; set; }
        public string AdminDecision { get; set; } = string.Empty;
        public string AdminDecisionReason { get; set; } = string.Empty;
        public decimal TotalBomCost { get; set; }
        public decimal BudgetCap { get; set; }
        public decimal WasteAllowanceBudget { get; set; }
        public decimal Contingency { get; set; }
        public decimal Forecast { get; set; }
        public decimal ReservedAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public string Readiness { get; set; } = "Pending";
        public bool HasSavedPlan { get; set; }
        public List<string> RiskFlags { get; set; } = new();
        public List<FinanceBudgetPlannerProductDto> Products { get; set; } = new();
    }

    public class SaveFinanceBudgetPlannerPlanRequest
    {
        [Range(typeof(decimal), "0.01", "99999999999999.99", ErrorMessage = "Collection budget cap must be between 0.01 and 99,999,999,999,999.99.")]
        public decimal BudgetCap { get; set; }

        [Range(0, 100, ErrorMessage = "Contingency must be between 0 and 100.")]
        public decimal Contingency { get; set; }

        [Range(typeof(decimal), "0", "99999999999999.99", ErrorMessage = "Waste allowance budget must be between 0 and 99,999,999,999,999.99.")]
        public decimal WasteAllowanceBudget { get; set; }

        [StringLength(1000, ErrorMessage = "Notes must be at most 1000 characters.")]
        public string? Notes { get; set; }
    }
}
