using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class ProductTransaction
    {
        [Key]
        public int ProdTransID { get; set; }
        public int ProdInvID { get; set; }
        public int UserID { get; set; }
        public decimal QtyChanged { get; set; }
        [Required, StringLength(40)]
        public string TransactionType { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
