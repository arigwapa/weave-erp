using System.Security.Claims;

namespace weave_erp_backend_api.Services
{
    public class AuditLogMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditLogMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AuditLogService auditLogService)
        {
            await _next(context);

            if (!ShouldLog(context))
            {
                return;
            }

            var performedBy = context.User.FindFirstValue(ClaimTypes.Name)
                ?? context.User.Identity?.Name
                ?? "Unknown";
            var roleName = context.User.FindFirstValue(ClaimTypes.Role);
            var action = $"{context.Request.Method.ToUpperInvariant()} {context.Request.Path.Value}";
            var description = $"Status {context.Response.StatusCode}";
            var module = ResolveModule(context.Request.Path.Value);
            var ip = context.Connection.RemoteIpAddress?.ToString();
            var userAgent = context.Request.Headers.UserAgent.ToString();
            var ipAgent = string.IsNullOrWhiteSpace(userAgent)
                ? ip
                : $"{ip ?? "N/A"} / {userAgent}";

            try
            {
                await auditLogService.WriteAsync(performedBy, roleName, action, description, module, ipAgent);
            }
            catch
            {
                // Do not block request completion when audit persistence fails.
            }
        }

        private static bool ShouldLog(HttpContext context)
        {
            if (context.User?.Identity?.IsAuthenticated != true)
            {
                return false;
            }

            var method = context.Request.Method.ToUpperInvariant();
            if (method == "GET" || method == "HEAD" || method == "OPTIONS")
            {
                return false;
            }

            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
            if (path.StartsWith("/api/auditlogs")
                || path.StartsWith("/hubs/")
                || path.StartsWith("/notificationhub"))
            {
                return false;
            }

            return true;
        }

        private static string ResolveModule(string? path)
        {
            var clean = (path ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(clean)) return "Workflow";
            if (clean.StartsWith("/api/auth")) return "Auth";
            if (clean.StartsWith("/api/users")) return "Users";
            if (clean.StartsWith("/api/admin/approval-inbox")) return "Approval Inbox";
            if (clean.StartsWith("/api/productioninventory")) return "Warehouse Inventory";
            if (clean.StartsWith("/api/binlocation")) return "Bin Location";
            if (clean.StartsWith("/api/audit")) return "Audit";
            return "Workflow";
        }
    }
}
