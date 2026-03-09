using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class FinanceCostingBomLineDto
    {
        public int BillOfMaterialsID { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public decimal QtyRequired { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
    }

    public class FinanceCostingProductDto
    {
        public int ProductID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string SizeProfile { get; set; } = string.Empty;
        public string CostingStatus { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;
        public string BomVersion { get; set; } = "-";
        public decimal TotalCost { get; set; }
        public List<FinanceCostingBomLineDto> BomLines { get; set; } = new();
    }

    public class FinanceCostingCollectionDto
    {
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CostingStatus { get; set; } = string.Empty;
        public decimal TotalBudgetNeeded { get; set; }
        public int ProductCount { get; set; }
        public int BomLineCount { get; set; }
        public List<FinanceCostingProductDto> Products { get; set; } = new();
    }

    public class ApproveFinanceCostingProductRequest
    {
        [StringLength(40, ErrorMessage = "Approval status must be at most 40 characters.")]
        public string ApprovalStatus { get; set; } = "Approved";
    }

    public class ApproveFinanceCostingCollectionRequest
    {
        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = "For Budget Planning";
    }
}
