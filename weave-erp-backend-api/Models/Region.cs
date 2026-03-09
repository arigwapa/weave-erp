using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class Region
    {
        [Key]
        public int RegionID { get; set; }
        [Required, StringLength(100)]
        public string RegionName { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int CreatedByUserID { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedByUserID { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
