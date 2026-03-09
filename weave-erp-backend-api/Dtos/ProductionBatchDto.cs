using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class ProductionBatchDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Order ID must be greater than 0.")]
        public int OrderID { get; set; }

        [Required(ErrorMessage = "Batch number is required.")]
        [StringLength(80, ErrorMessage = "Batch number must be at most 80 characters.")]
        public string BatchNumber { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "Batch quantity must be greater than 0.")]
        public int BatchQty { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;
    }
}
