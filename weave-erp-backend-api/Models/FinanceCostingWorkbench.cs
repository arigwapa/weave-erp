namespace weave_erp_backend_api.Models
{
    public class FinanceCostingBomLine
    {
        public int BillOfMaterialsID { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public decimal QtyRequired { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
    }

    public class FinanceCostingProduct
    {
        public int ProductID { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string SizeProfile { get; set; } = string.Empty;
        public string CostingStatus { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = string.Empty;
        public string BomVersion { get; set; } = "-";
        public decimal TotalCost { get; set; }
        public List<FinanceCostingBomLine> BomLines { get; set; } = new();
    }

    public class FinanceCostingCollection
    {
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CostingStatus { get; set; } = string.Empty;
        public decimal TotalBudgetNeeded { get; set; }
        public int ProductCount { get; set; }
        public int BomLineCount { get; set; }
        public List<FinanceCostingProduct> Products { get; set; } = new();
    }
}
