using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class UserDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Branch ID must be greater than 0.")]
        public int BranchID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Role ID must be greater than 0.")]
        public int RoleID { get; set; }

        [Required(ErrorMessage = "Username is required.")]
        [StringLength(100, ErrorMessage = "Username must be at most 100 characters.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(160, ErrorMessage = "Full name must be at most 160 characters.")]
        public string Fullname { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email format is invalid.")]
        [StringLength(120, ErrorMessage = "Email must be at most 120 characters.")]
        public string? Email { get; set; }

        [StringLength(30, ErrorMessage = "Contact number must be at most 30 characters.")]
        public string? ContactNumber { get; set; }

        [Required(ErrorMessage = "Password hash is required.")]
        [StringLength(255, ErrorMessage = "Password hash must be at most 255 characters.")]
        public string PasswordHash { get; set; } = string.Empty;
    }
}
