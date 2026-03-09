namespace weave_erp_backend_api.Dtos
{
    public static class ProductionOrderWorkflowStatuses
    {
        public const string Pending = "Pending";
        public const string ForScheduling = "For Scheduling";
        public const string ScheduleReady = "Schedule Ready";
        public const string ScheduleRunning = "Schedule Running";
        public const string FinishedRun = "Finished Run";
    }

    public class ProductionOrderDto
    {
        public int OrderID { get; set; }
        public string CollectionName { get; set; } = string.Empty;
        public string? VersionNumber { get; set; }
        public string Products { get; set; } = string.Empty;
        public string Status { get; set; } = ProductionOrderWorkflowStatuses.Pending;
        public string? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateProductionOrderRequest
    {
        public string CollectionName { get; set; } = string.Empty;
        public string Products { get; set; } = string.Empty;
        public string? DueDate { get; set; }
    }
}
