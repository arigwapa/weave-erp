using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BillOfMaterialsDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Product ID must be greater than 0.")]
        public int ProductID { get; set; }

        [Required(ErrorMessage = "Material name is required.")]
        [StringLength(180, ErrorMessage = "Material name must be at most 180 characters.")]
        public string MaterialName { get; set; } = string.Empty;

        [Range(0.0001, double.MaxValue, ErrorMessage = "Required quantity must be greater than 0.")]
        public decimal QtyRequired { get; set; }

        [Required(ErrorMessage = "Unit is required.")]
        [StringLength(20, ErrorMessage = "Unit must be at most 20 characters.")]
        public string Unit { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Unit cost must be 0 or greater.")]
        public decimal UnitCost { get; set; }
    }
}
