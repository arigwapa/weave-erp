using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/superadmin/warehouses")]
    public class SuperAdminWarehousesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuperAdminWarehousesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var warehouses = await _context.Branches
                .AsNoTracking()
                .OrderBy(x => x.BranchID)
                .Select(branch => new
                {
                    id = branch.BranchID,
                    name = branch.BranchName,
                    address = branch.Address ?? string.Empty,
                    capacity = branch.Capacity,
                    active = branch.IsActive ? "Active" : "Inactive",
                    warehouseManagerUserID = branch.WarehouseManagerUserID,
                    warehouseManagerName = _context.Users
                        .Where(u => u.UserID == branch.WarehouseManagerUserID)
                        .Select(u => u.Fullname)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(warehouses);
        }

        [HttpPut]
        public async Task<IActionResult> SaveAll([FromBody] WarehousesPayload payload)
        {
            if (payload?.Items == null)
            {
                return BadRequest("Payload must include items.");
            }

            foreach (var item in payload.Items)
            {
                var name = (item.Name ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(name))
                {
                    continue;
                }

                if (item.Id > 0)
                {
                    var existing = await _context.Branches.FirstOrDefaultAsync(x => x.BranchID == item.Id);
                    if (existing == null)
                    {
                        continue;
                    }

                    existing.BranchName = name;
                    existing.Address = string.IsNullOrWhiteSpace(item.Address) ? null : item.Address.Trim();
                    existing.Capacity = Math.Max(0, Math.Min(100, item.Capacity));
                    existing.IsActive = NormalizeStatus(item.Active) == "Active";
                    existing.UpdatedAt = DateTime.UtcNow;
                    continue;
                }

                _context.Branches.Add(new Branch
                {
                    BranchName = name,
                    Address = string.IsNullOrWhiteSpace(item.Address) ? null : item.Address.Trim(),
                    Capacity = Math.Max(0, Math.Min(100, item.Capacity)),
                    IsActive = NormalizeStatus(item.Active) == "Active",
                    CreatedByUserID = 1,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static string NormalizeStatus(string? active)
        {
            var status = (active ?? "Active").Trim();
            return string.Equals(status, "Inactive", StringComparison.OrdinalIgnoreCase) ? "Inactive" : "Active";
        }
    }

    public class WarehousesPayload
    {
        public List<WarehouseItemDto> Items { get; set; } = new();
    }

    public class WarehouseItemDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public int Capacity { get; set; }
        public string? Active { get; set; }
    }
}
