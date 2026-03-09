namespace weave_erp_backend_api.Dtos
{
    public class PlmRevisionQueueItemDto
    {
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string Season { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AdminDecision { get; set; } = string.Empty;
        public string AdminDecisionReason { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
        public bool IsRevision { get; set; }
    }
}
