using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class TransferDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Request ID must be greater than 0.")]
        public int RequestID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "From-bin ID must be greater than 0.")]
        public int FromBinID { get; set; }

        [Required(ErrorMessage = "Scheduled date is required.")]
        public DateOnly ScheduledDate { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string Status { get; set; } = string.Empty;
    }
}
