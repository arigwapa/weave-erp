using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class MaterialTransactionDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Material inventory ID must be greater than 0.")]
        public int MatInvID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "User ID must be greater than 0.")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "Transaction type is required.")]
        [StringLength(40, ErrorMessage = "Transaction type must be at most 40 characters.")]
        public string TransactionType { get; set; } = string.Empty;
    }
}
