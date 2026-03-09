using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class ProductionVersion
    {
        [Key]
        public int VersionID { get; set; }

        [Required, StringLength(50)]
        public string VersionNumber { get; set; } = string.Empty;

        public int ProductID { get; set; }
        public int OrderID { get; set; }
        public int CollectionID { get; set; }

        [StringLength(80)]
        public string CollectionCode { get; set; } = string.Empty;

        [StringLength(180)]
        public string CollectionName { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
