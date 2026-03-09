using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class CollectionDto
    {
        [Required(ErrorMessage = "Collection code is required.")]
        [StringLength(50, ErrorMessage = "Collection code must be at most 50 characters.")]
        public string CollectionCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Collection name is required.")]
        [StringLength(160, ErrorMessage = "Collection name must be at most 160 characters.")]
        public string CollectionName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Season is required.")]
        [StringLength(60, ErrorMessage = "Season must be at most 60 characters.")]
        public string Season { get; set; } = string.Empty;

        [Required(ErrorMessage = "Target launch date is required.")]
        public DateTime TargetLaunchDate { get; set; }

        [StringLength(1000, ErrorMessage = "Notes must be at most 1000 characters.")]
        public string? Notes { get; set; }
    }
}
