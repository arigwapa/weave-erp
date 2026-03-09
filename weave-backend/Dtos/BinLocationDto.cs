using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class CreateBinLocationRequest
    {
        [Required(ErrorMessage = "Bin location is required.")]
        [StringLength(80, ErrorMessage = "Bin location must be at most 80 characters.")]
        public string BinLocation { get; set; } = string.Empty;
    }

    public class UpdateBinLocationRequest
    {
        [Required(ErrorMessage = "Bin location is required.")]
        [StringLength(80, ErrorMessage = "Bin location must be at most 80 characters.")]
        public string BinLocation { get; set; } = string.Empty;
    }

    public class BinLocationListItemDto
    {
        public int BinID { get; set; }
        public string BinLocation { get; set; } = string.Empty;
        public string BinCode { get; set; } = string.Empty;
        public bool IsBinActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string OccupancyStatus { get; set; } = "Available";
        public decimal OccupiedQuantity { get; set; }
        public int? OccupiedVersionID { get; set; }
    }
}
