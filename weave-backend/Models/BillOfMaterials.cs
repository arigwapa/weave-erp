using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class BillOfMaterials
    {
        [Key]
        public int BOMID { get; set; }
        public int ProductID { get; set; }
        [Required, StringLength(180)]
        public string MaterialName { get; set; } = string.Empty;
        public decimal QtyRequired { get; set; }
        [Required, StringLength(20)]
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
