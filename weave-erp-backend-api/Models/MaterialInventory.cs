using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class MaterialInventory
    {
        [Key]
        public int MatInvID { get; set; }
        public int BinID { get; set; }
        public int MaterialID { get; set; }
        public decimal QuantityOnHand { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
