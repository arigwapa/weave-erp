using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class NotificationDto
    {
        [Required(ErrorMessage = "Notification type is required.")]
        [StringLength(40, ErrorMessage = "Notification type must be at most 40 characters.")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "Notification message is required.")]
        public string Message { get; set; } = string.Empty;
    }
}
