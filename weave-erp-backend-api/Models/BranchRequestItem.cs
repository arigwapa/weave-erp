using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class BranchRequestItem
    {
        [Key]
        public int RequestItemID { get; set; }
        public int RequestID { get; set; }
        public int VersionID { get; set; }
        public int QtyRequested { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
