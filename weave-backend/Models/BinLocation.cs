using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Models
{
    public class BinLocation
    {
        [Key]
        public int BinID { get; set; }

        [Required, StringLength(80)]
        public string BinLocationName { get; set; } = string.Empty;

        public bool IsBinActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
