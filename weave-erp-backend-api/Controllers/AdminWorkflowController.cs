using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminWorkflowController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminWorkflowController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("notification-center")]
        public async Task<ActionResult<IEnumerable<object>>> GetNotificationCenter(
            [FromQuery] string? role = null,
            [FromQuery] int? branchId = null)
        {
            var notifications = await _context.Notifications
                .AsNoTracking()
                .OrderByDescending(item => item.CreatedAt)
                .Take(200)
                .ToListAsync();

            var normalizedRole = string.IsNullOrWhiteSpace(role) ? "All" : role.Trim();

            var result = notifications.Select(item => new
            {
                NotificationID = item.NotificationID.ToString(),
                RoleTarget = normalizedRole,
                Channel = string.Equals(item.Type, "Alert", StringComparison.OrdinalIgnoreCase)
                    ? "Real-time"
                    : "History",
                Title = string.Equals(item.Type, "Alert", StringComparison.OrdinalIgnoreCase)
                    ? "System Alert"
                    : "System Update",
                Message = item.Message ?? string.Empty,
                Timestamp = item.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                IsUnread = !item.IsRead
            });

            return Ok(result);
        }
    }
}
