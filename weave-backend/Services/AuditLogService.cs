using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class AuditLogService
    {
        private readonly AppDbContext _context;

        public AuditLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task WriteAsync(
            string performedBy,
            string? roleName,
            string action,
            string description,
            string? module = null,
            string? ipAgent = null)
        {
            if (string.IsNullOrWhiteSpace(performedBy) || string.IsNullOrWhiteSpace(action))
            {
                return;
            }

            var entry = new AuditLog
            {
                PerformedBy = performedBy.Trim(),
                RoleName = string.IsNullOrWhiteSpace(roleName) ? null : roleName.Trim(),
                Action = action.Trim(),
                Description = string.IsNullOrWhiteSpace(description) ? "-" : description.Trim(),
                PerformedAt = DateTime.UtcNow
            };

            _context.AuditLogs.Add(entry);
            _context.AuditViewerRows.Add(new AuditViewer
            {
                DatePerformed = entry.PerformedAt,
                Actor = entry.PerformedBy,
                Role = entry.RoleName ?? "Unknown",
                Module = string.IsNullOrWhiteSpace(module) ? "Workflow" : module.Trim(),
                Action = entry.Action,
                Reason = entry.Description,
                IpAgent = string.IsNullOrWhiteSpace(ipAgent) ? null : ipAgent.Trim()
            });
            await _context.SaveChangesAsync();
        }
    }
}
