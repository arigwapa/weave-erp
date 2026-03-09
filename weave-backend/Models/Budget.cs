using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Budget
    {
        [Key]
        public int BudgetID { get; set; }
        [Required, StringLength(80)]
        public string BudgetCode { get; set; } = string.Empty;
        public int? CollectionID { get; set; }
        public bool AppliesToAll { get; set; }
        public DateOnly PeriodStart { get; set; }
        public DateOnly PeriodEnd { get; set; }
        public decimal MaterialsBudget { get; set; }
        public decimal WasteAllowanceBudget { get; set; }
        public decimal TotalBudget { get; set; }
        public decimal ReservedAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        [Required, StringLength(40)]
        public string Status { get; set; } = string.Empty;
        [Required]
        public string Notes { get; set; } = string.Empty;
        public string? RejectionReason { get; set; }
        public int CreatedByUserID { get; set; }
        public int? SubmittedByUserID { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public int? ApprovedByUserID { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
