using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class BudgetReservation
    {
        [Key]
        public int BudgetReservationID { get; set; }
        public int BudgetID { get; set; }
        public int VersionID { get; set; }
        public decimal MaterialAmount { get; set; }
        public decimal LaborAmount { get; set; }
        public decimal OverheadAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
