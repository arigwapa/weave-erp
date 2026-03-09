using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class RoleDto
    {
        [Required(ErrorMessage = "Role display name is required.")]
        [StringLength(120, ErrorMessage = "Role display name must be at most 120 characters.")]
        public string DisplayName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role scope is required.")]
        [StringLength(80, ErrorMessage = "Role scope must be at most 80 characters.")]
        public string Scope { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Role description must be at most 500 characters.")]
        public string? Description { get; set; }
    }
}
