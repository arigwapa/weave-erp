using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BudgetReservationDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Budget ID must be greater than 0.")]
        public int BudgetID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Version ID must be greater than 0.")]
        public int VersionID { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Material amount must be 0 or greater.")]
        public decimal MaterialAmount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Labor amount must be 0 or greater.")]
        public decimal LaborAmount { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Overhead amount must be 0 or greater.")]
        public decimal OverheadAmount { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;
    }
}
