using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class ProductionInventoryDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Bin ID must be greater than 0.")]
        public int BinID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Version ID must be greater than 0.")]
        public int VersionID { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Quantity on hand must be 0 or greater.")]
        public decimal QuantityOnHand { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;
    }

    public class WarehouseInventoryRowDto
    {
        public int ProdInvID { get; set; }
        public int VersionID { get; set; }
        public int BinID { get; set; }
        public string BinLocation { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string BranchName { get; set; } = string.Empty;
        public decimal QuantityOnHand { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ReleaseTag { get; set; } = "Official Version";
        public int? SourceInspectionID { get; set; }
        public int? BatchBoardID { get; set; }
        public int? ProductID { get; set; }
        public string? ReceivedAt { get; set; }
    }
}
