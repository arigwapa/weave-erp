using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BudgetDto
    {
        [Required(ErrorMessage = "Budget code is required.")]
        [StringLength(80, ErrorMessage = "Budget code must be at most 80 characters.")]
        public string BudgetCode { get; set; } = string.Empty;

        [Range(1, int.MaxValue, ErrorMessage = "Collection is required.")]
        public int? CollectionID { get; set; }

        [Required(ErrorMessage = "Period start is required.")]
        public DateOnly PeriodStart { get; set; }

        [Required(ErrorMessage = "Period end is required.")]
        public DateOnly PeriodEnd { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Materials budget must be 0 or greater.")]
        public decimal MaterialsBudget { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Waste allowance budget must be 0 or greater.")]
        public decimal WasteAllowanceBudget { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;

        [Required(ErrorMessage = "Notes are required.")]
        public string Notes { get; set; } = string.Empty;
    }
}
