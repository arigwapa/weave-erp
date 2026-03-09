using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class TransferItemDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Transfer ID must be greater than 0.")]
        public int TransferID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Version ID must be greater than 0.")]
        public int VersionID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Shipped quantity must be greater than 0.")]
        public int QtyShipped { get; set; }
    }
}
