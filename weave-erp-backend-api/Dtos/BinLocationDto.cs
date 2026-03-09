using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class BinLocationDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Branch ID must be greater than 0.")]
        public int BranchID { get; set; }

        [Required(ErrorMessage = "Bin code is required.")]
        [StringLength(80, ErrorMessage = "Bin code must be at most 80 characters.")]
        public string BinCode { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Capacity must be 0 or greater.")]
        public decimal Capacity { get; set; }

        [Required(ErrorMessage = "Bin type is required.")]
        [StringLength(40, ErrorMessage = "Bin type must be at most 40 characters.")]
        public string Type { get; set; } = string.Empty;
    }
}
