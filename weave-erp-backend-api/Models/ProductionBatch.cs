using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class ProductionBatch
    {
        [Key]
        public int BatchID { get; set; }
        public int OrderID { get; set; }
        [Required, StringLength(80)]
        public string BatchNumber { get; set; } = string.Empty;
        public int BatchQty { get; set; }
        public DateOnly? ProducedDate { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
