namespace weave_erp_backend_api.Dtos
{
    public class ProductionBatchBoardItemDto
    {
        public string Code { get; set; } = string.Empty;
        public int OrderID { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public int ProductID { get; set; }
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public string RunCode { get; set; } = string.Empty;
        public string ScheduleKey { get; set; } = string.Empty;
        public string SourceStatus { get; set; } = string.Empty;
        public string Product { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Qty { get; set; }
        public string Status { get; set; } = "In Progress";
        public string? HandoffNotes { get; set; }
    }

    public class ProductionBatchCandidateDto
    {
        public int OrderID { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public int ProductID { get; set; }
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string RunCode { get; set; } = string.Empty;
        public string ScheduleKey { get; set; } = string.Empty;
        public string SourceStatus { get; set; } = string.Empty;
        public int PlannedQty { get; set; }
        public Dictionary<string, int> SizePlan { get; set; } = new();
    }

    public class SaveProductionBatchBoardRequest
    {
        public List<ProductionBatchBoardItemDto> Items { get; set; } = new();
    }
}
