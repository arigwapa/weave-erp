using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class CollectionBudgetPlan
    {
        [Key]
        public int CollectionBudgetPlanID { get; set; }

        [Required]
        public int CollectionID { get; set; }

        public decimal BudgetCap { get; set; }
        public decimal ContingencyPercent { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        [StringLength(40)]
        public string? AdminDecision { get; set; }

        [StringLength(1000)]
        public string? AdminDecisionReason { get; set; }

        public DateTime? AdminDecisionAt { get; set; }
        public bool SentToProductManager { get; set; }
        public bool SentToProductionManager { get; set; }

        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
