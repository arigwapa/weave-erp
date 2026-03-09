using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class ProductionInventory
    {
        [Key]
        public int ProdInvID { get; set; }
        public int BinID { get; set; }
        public int VersionID { get; set; }
        public decimal QuantityOnHand { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
