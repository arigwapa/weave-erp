using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class MaterialInventoryDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Bin ID must be greater than 0.")]
        public int BinID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Material ID must be greater than 0.")]
        public int MaterialID { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Quantity on hand must be 0 or greater.")]
        public decimal QuantityOnHand { get; set; }
    }
}
