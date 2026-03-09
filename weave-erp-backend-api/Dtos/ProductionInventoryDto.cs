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
}
