using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
