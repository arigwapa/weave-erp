using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
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

        [HttpGet("task-inbox")]
        public async Task<ActionResult<IEnumerable<object>>> GetTaskInbox(
            [FromQuery] string? role = null,
            [FromQuery] int? branchId = null)
        {
            var normalizedRole = string.IsNullOrWhiteSpace(role) ? "Admin" : role.Trim();
            var collections = await _context.Collections
                .AsNoTracking()
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt)
                .Take(50)
                .ToListAsync();

            var result = collections.Select(item => new
            {
                TaskID = $"TASK-{item.CollectionID}",
                Role = normalizedRole,
                Action = (item.Status ?? string.Empty).Contains("revision", StringComparison.OrdinalIgnoreCase)
                    ? "Review Revision"
                    : "Review Submission",
                CollectionCode = item.CollectionCode,
                VersionLabel = "Latest",
                DueIn = "Today",
                Priority = "Medium"
            });

            return Ok(result);
        }

        [HttpGet("workflow-timeline")]
        public async Task<ActionResult<IEnumerable<object>>> GetWorkflowTimeline(
            [FromQuery] string? role = null,
            [FromQuery] int? branchId = null)
        {
            var plans = await _context.CollectionBudgetPlans
                .AsNoTracking()
                .OrderByDescending(item => item.AdminDecisionAt ?? item.UpdatedAt ?? item.CreatedAt)
                .Take(100)
                .ToListAsync();
            var collectionMap = await _context.Collections
                .AsNoTracking()
                .ToDictionaryAsync(item => item.CollectionID);

            var result = plans.Select(item =>
            {
                var hasCollection = collectionMap.TryGetValue(item.CollectionID, out var collection);
                var decision = (item.AdminDecision ?? string.Empty).Trim();
                var status = decision.Contains("reject", StringComparison.OrdinalIgnoreCase)
                    ? "Blocked"
                    : decision.Contains("revision", StringComparison.OrdinalIgnoreCase)
                        ? "In Progress"
                        : "Done";

                return new
                {
                    EventID = $"EVT-{item.CollectionID}-{item.CollectionBudgetPlanID}",
                    CollectionCode = hasCollection ? collection!.CollectionCode : $"COL-{item.CollectionID}",
                    VersionLabel = "Latest",
                    Stage = "Admin Approval",
                    OwnerRole = "Admin",
                    Timestamp = (item.AdminDecisionAt ?? item.UpdatedAt ?? item.CreatedAt).ToString("O"),
                    Status = status
                };
            });

            return Ok(result);
        }

        [HttpGet("approvals-history")]
        public async Task<ActionResult<IEnumerable<object>>> GetApprovalsHistory(
            [FromQuery] string? role = null,
            [FromQuery] int? branchId = null)
        {
            var plans = await _context.CollectionBudgetPlans
                .AsNoTracking()
                .Where(item => !string.IsNullOrWhiteSpace(item.AdminDecision))
                .OrderByDescending(item => item.AdminDecisionAt ?? item.UpdatedAt ?? item.CreatedAt)
                .Take(100)
                .ToListAsync();
            var collectionMap = await _context.Collections
                .AsNoTracking()
                .ToDictionaryAsync(item => item.CollectionID);

            var result = plans.Select(item =>
            {
                var hasCollection = collectionMap.TryGetValue(item.CollectionID, out var collection);
                var decision = (item.AdminDecision ?? string.Empty).ToLowerInvariant();
                var normalizedDecision = decision.Contains("reject")
                    ? "Rejected"
                    : decision.Contains("revision")
                        ? "Returned"
                        : "Approved";

                return new
                {
                    ApprovalID = $"APR-{item.CollectionID}-{item.CollectionBudgetPlanID}",
                    CollectionCode = hasCollection ? collection!.CollectionCode : $"COL-{item.CollectionID}",
                    VersionLabel = "Latest",
                    ReviewerName = "Admin",
                    Decision = normalizedDecision,
                    Reason = item.AdminDecisionReason ?? string.Empty,
                    ActedAt = (item.AdminDecisionAt ?? item.UpdatedAt ?? item.CreatedAt).ToString("O")
                };
            });

            return Ok(result);
        }

        [HttpGet("notification-center")]
        public async Task<ActionResult<IEnumerable<object>>> GetNotificationCenter(
            [FromQuery] string? role = null,
            [FromQuery] int? branchId = null)
        {
            var currentUserId = GetActorUserId();
            var notifications = await _context.Notifications
                .AsNoTracking()
                .Where(item => !item.UserID.HasValue || (currentUserId.HasValue && item.UserID == currentUserId.Value))
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

        private int? GetActorUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }
    }
}
