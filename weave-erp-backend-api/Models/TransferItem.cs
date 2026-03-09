using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class TransferItem
    {
        [Key]
        public int TransferItemID { get; set; }
        public int TransferID { get; set; }
        public int VersionID { get; set; }
        public int QtyShipped { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
