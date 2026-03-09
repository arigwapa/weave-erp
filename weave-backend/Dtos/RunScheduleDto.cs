namespace weave_erp_backend_api.Dtos
{
    public class RunScheduleRecordDto
    {
        public string Key { get; set; } = string.Empty;
        public int CollectionID { get; set; }
        public int ProductID { get; set; }
        public string RunCode { get; set; } = string.Empty;
        public string LineTeam { get; set; } = string.Empty;
        public string OwnerAssignment { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public int PlannedQty { get; set; }
        public string Status { get; set; } = "For Scheduling";
        public string Source { get; set; } = "Queue";
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string? LinkedVersion { get; set; }
        public string SizePlanJson { get; set; } = "{}";
    }

    public class SaveRunSchedulesRequest
    {
        public List<RunScheduleRecordDto> Items { get; set; } = new();
    }
}
