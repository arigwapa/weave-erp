using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class BinLocation
    {
        [Key]
        public int BinID { get; set; }
        public int BranchID { get; set; }
        [Required, StringLength(80)]
        public string BinCode { get; set; } = string.Empty;
        public decimal Capacity { get; set; }
        [Required, StringLength(40)]
        public string Type { get; set; } = string.Empty;
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
