using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/productioninventory")]
    public class ProductionInventoriesController : GenericCrudController<ProductionInventory>
    {
        private readonly AppDbContext _context;

        public ProductionInventoriesController(AppDbContext context) : base(context, "ProdInvID")
        {
            _context = context;
        }

        [HttpGet("warehouse-table")]
        public async Task<ActionResult<IEnumerable<WarehouseInventoryRowDto>>> WarehouseTable()
        {
            var inventories = await _context.ProductionInventories
                .AsNoTracking()
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt)
                .ToListAsync();

            if (inventories.Count == 0)
            {
                return Ok(Array.Empty<WarehouseInventoryRowDto>());
            }

            var versionIds = inventories.Select(item => item.VersionID).Distinct().ToList();
            var binIds = inventories.Select(item => item.BinID).Distinct().ToList();
            var versions = await _context.ProductionVersions
                .AsNoTracking()
                .Where(item => versionIds.Contains(item.VersionID))
                .ToDictionaryAsync(item => item.VersionID);
            var bins = await _context.BinLocations
                .AsNoTracking()
                .Where(item => binIds.Contains(item.BinID))
                .ToDictionaryAsync(item => item.BinID);

            var rows = inventories.Select(item =>
            {
                var version = versions.TryGetValue(item.VersionID, out var mappedVersion) ? mappedVersion : null;
                var bin = bins.TryGetValue(item.BinID, out var mappedBin) ? mappedBin : null;
                return new WarehouseInventoryRowDto
                {
                    ProdInvID = item.ProdInvID,
                    VersionID = item.VersionID,
                    BinID = item.BinID,
                    BinLocation = bin?.BinLocationName ?? string.Empty,
                    CollectionName = string.IsNullOrWhiteSpace(item.CollectionName)
                        ? version?.CollectionName ?? string.Empty
                        : item.CollectionName,
                    BranchName = item.BranchName ?? string.Empty,
                    QuantityOnHand = item.QuantityOnHand,
                    Status = item.Status,
                    ReleaseTag = string.IsNullOrWhiteSpace(item.ReleaseTag) ? "Official Version" : item.ReleaseTag,
                    SourceInspectionID = item.SourceInspectionID,
                    BatchBoardID = item.BatchBoardID,
                    ProductID = item.ProductID ?? version?.ProductID,
                    ReceivedAt = (item.ReceivedAt ?? item.CreatedAt).ToString("O")
                };
            }).ToList();

            return Ok(rows);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<ProductionInventory>>> Archived()
        {
            var items = await _context.ProductionInventories
                .AsNoTracking()
                .Where(x => x.Status == "Archived")
                .ToListAsync();
            return Ok(items);
        }

        [HttpPut("{id:int}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var item = await _context.ProductionInventories.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = "Archived";
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var item = await _context.ProductionInventories.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = "Available";
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id:int}/mark-low-stock")]
        public async Task<ActionResult<ProductionInventory>> MarkLowStock(int id)
        {
            return await SetStatus(id, "Low Stock");
        }

        [HttpPost("{id:int}/request-replenishment")]
        public async Task<ActionResult<ProductionInventory>> RequestReplenishment(int id)
        {
            return await SetStatus(id, "Replenishment Requested");
        }

        [HttpPost("{id:int}/mark-in-production")]
        public async Task<ActionResult<ProductionInventory>> MarkInProduction(int id)
        {
            return await SetStatus(id, "In Production");
        }

        [HttpPost("{id:int}/mark-available")]
        public async Task<ActionResult<ProductionInventory>> MarkAvailable(int id)
        {
            return await SetStatus(id, "Available");
        }

        private async Task<ActionResult<ProductionInventory>> SetStatus(int id, string status)
        {
            var item = await _context.ProductionInventories.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = status;
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }
    }
}
