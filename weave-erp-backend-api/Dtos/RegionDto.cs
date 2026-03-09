using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class RegionDto
    {
        [Required(ErrorMessage = "Region name is required.")]
        [StringLength(100, ErrorMessage = "Region name must be at most 100 characters.")]
        public string RegionName { get; set; } = string.Empty;
    }
}
