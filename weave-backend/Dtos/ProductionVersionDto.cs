namespace weave_erp_backend_api.Dtos
{
    public class ProductionVersionDto
    {
        public int VersionID { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public int ProductID { get; set; }
        public int OrderID { get; set; }
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateProductionVersionRequest
    {
        public string VersionNumber { get; set; } = string.Empty;
        public int ProductID { get; set; }
        public int OrderID { get; set; }
        public int CollectionID { get; set; }
        public string CollectionCode { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
    }
}
