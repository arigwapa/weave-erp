using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [Route("api/roles")]
    public class RolesController : GenericCrudController<Role>
    {
        private readonly AppDbContext _context;

        private static readonly string[] BaselineRoles =
        {
            "Admin",
            "Branch Manager",
            "Product Manager",
            "Production Manager",
            "QA Manager"
        };

        public RolesController(AppDbContext context) : base(context, "RoleID")
        {
            _context = context;
        }

        [HttpGet]
        public override async Task<ActionResult<IEnumerable<Role>>> GetAll()
        {
            var dbRoles = await _context.Roles
                .AsNoTracking()
                .Where(r => r.IsActive)
                .Select(r => r.DisplayName)
                .ToListAsync();

            var normalized = dbRoles
                .Select(NormalizeRoleName)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Where(name => !name.StartsWith("Role ", StringComparison.OrdinalIgnoreCase))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var baseline in BaselineRoles)
            {
                if (!normalized.Contains(baseline, StringComparer.OrdinalIgnoreCase))
                {
                    normalized.Add(baseline);
                }
            }

            var payload = normalized
                .OrderBy(x => x)
                .Select((name, idx) => new
                {
                    RoleID = idx + 1,
                    DisplayName = name,
                    Scope = "Workflow",
                    Description = "System role",
                    IsActive = true
                });

            return Ok(payload);
        }

        private static string NormalizeRoleName(string? roleName)
        {
            var clean = (roleName ?? string.Empty).Trim();
            if (string.Equals(clean, "PLM Manager", StringComparison.OrdinalIgnoreCase))
            {
                return "Product Manager";
            }

            if (string.Equals(clean, "Product Finance Budget Manager", StringComparison.OrdinalIgnoreCase))
            {
                return "Product Manager";
            }

            if (string.Equals(clean, "Finance Manager", StringComparison.OrdinalIgnoreCase))
            {
                return "Product Manager";
            }

            if (string.Equals(clean, "Product Quality Manager", StringComparison.OrdinalIgnoreCase))
            {
                return "QA Manager";
            }

            if (string.Equals(clean, "Warehouse Manager", StringComparison.OrdinalIgnoreCase))
            {
                return "Branch Manager";
            }

            return clean;
        }
    }
}
