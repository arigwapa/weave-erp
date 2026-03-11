using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/auditlogs")]
    public class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("superadmin")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetSuperAdminLogs([FromQuery] AuditLogsQuery query)
        {
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 50 : Math.Min(query.PageSize, 500);

            var baseQuery = _context.AuditLogs.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(query.Action))
            {
                var action = query.Action.Trim();
                baseQuery = baseQuery.Where(x => x.Action.Contains(action));
            }

            if (!string.IsNullOrWhiteSpace(query.Role))
            {
                var role = query.Role.Trim();
                baseQuery = baseQuery.Where(x => (x.RoleName ?? "").Contains(role));
            }

            if (!string.IsNullOrWhiteSpace(query.Q))
            {
                var search = query.Q.Trim();
                baseQuery = baseQuery.Where(x =>
                    x.PerformedBy.Contains(search)
                    || x.Action.Contains(search)
                    || x.Description.Contains(search)
                    || (x.RoleName ?? "").Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.From) && DateTime.TryParse(query.From, out var from))
            {
                baseQuery = baseQuery.Where(x => x.PerformedAt >= from.ToUniversalTime());
            }

            if (!string.IsNullOrWhiteSpace(query.To) && DateTime.TryParse(query.To, out var to))
            {
                baseQuery = baseQuery.Where(x => x.PerformedAt <= to.ToUniversalTime());
            }

            var totalCount = await baseQuery.CountAsync();
            var items = await baseQuery
                .OrderByDescending(x => x.PerformedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AuditLogEntryDto
                {
                    AuditID = x.AuditID,
                    Module = "Workflow",
                    Action = x.Action,
                    NewValue = x.Description,
                    PerformedAt = x.PerformedAt,
                    ActorUser = new AuditUserDto
                    {
                        UserID = 0,
                        Username = x.PerformedBy,
                        Fullname = x.PerformedBy,
                        RoleName = x.RoleName ?? "Unknown",
                        BranchID = 0
                    },
                    AffectedUser = new AuditUserDto
                    {
                        UserID = 0,
                        Username = x.PerformedBy,
                        Fullname = x.PerformedBy,
                        RoleName = x.RoleName ?? "Unknown",
                        BranchID = 0
                    }
                })
                .ToListAsync();

            return Ok(new AuditLogsResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpGet("branchadmin")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetBranchAdminLogs([FromQuery] AuditLogsQuery query)
        {
            var page = query.Page <= 0 ? 1 : query.Page;
            var pageSize = query.PageSize <= 0 ? 50 : Math.Min(query.PageSize, 500);

            var baseQuery = _context.AuditViewerRows
                .AsNoTracking()
                .Where(x => x.Role.ToLower() != "superadmin")
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Action))
            {
                var action = query.Action.Trim();
                baseQuery = baseQuery.Where(x => x.Action.Contains(action));
            }

            if (!string.IsNullOrWhiteSpace(query.Role))
            {
                var role = query.Role.Trim();
                baseQuery = baseQuery.Where(x => x.Role.Contains(role));
            }

            if (!string.IsNullOrWhiteSpace(query.Q))
            {
                var search = query.Q.Trim();
                baseQuery = baseQuery.Where(x =>
                    x.Actor.Contains(search)
                    || x.Action.Contains(search)
                    || x.Reason.Contains(search)
                    || x.Role.Contains(search)
                    || x.Module.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(query.From) && DateTime.TryParse(query.From, out var from))
            {
                baseQuery = baseQuery.Where(x => x.DatePerformed >= from.ToUniversalTime());
            }

            if (!string.IsNullOrWhiteSpace(query.To) && DateTime.TryParse(query.To, out var to))
            {
                baseQuery = baseQuery.Where(x => x.DatePerformed <= to.ToUniversalTime());
            }

            var totalCount = await baseQuery.CountAsync();
            var items = await baseQuery
                .OrderByDescending(x => x.DatePerformed)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new AuditLogEntryDto
                {
                    AuditID = x.EventID,
                    Module = x.Module,
                    Action = x.Action,
                    NewValue = x.Reason,
                    PerformedAt = x.DatePerformed,
                    IpAddress = x.IpAgent,
                    ActorUser = new AuditUserDto
                    {
                        UserID = 0,
                        Username = x.Actor,
                        Fullname = x.Actor,
                        RoleName = x.Role,
                        BranchID = 0
                    },
                    AffectedUser = new AuditUserDto
                    {
                        UserID = 0,
                        Username = x.Actor,
                        Fullname = x.Actor,
                        RoleName = x.Role,
                        BranchID = 0
                    }
                })
                .ToListAsync();

            return Ok(new AuditLogsResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }
    }

    public class AuditLogsQuery
    {
        public string? From { get; set; }
        public string? To { get; set; }
        public string? Role { get; set; }
        public string? Action { get; set; }
        public string? Q { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 50;
    }

    public class AuditLogsResponseDto
    {
        public List<AuditLogEntryDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    public class AuditLogEntryDto
    {
        public int AuditID { get; set; }
        public string Module { get; set; } = "Workflow";
        public string Action { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public DateTime PerformedAt { get; set; }
        public string? IpAddress { get; set; }
        public AuditUserDto AffectedUser { get; set; } = new();
        public AuditUserDto ActorUser { get; set; } = new();
    }

    public class AuditUserDto
    {
        public int UserID { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public int BranchID { get; set; }
    }
}
