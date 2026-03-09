using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/binlocation")]
    public class BinLocationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BinLocationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BinLocationListItemDto>>> GetActive()
        {
            return Ok(await BuildRowsAsync(isActive: true));
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<BinLocationListItemDto>>> GetArchived()
        {
            return Ok(await BuildRowsAsync(isActive: false));
        }

        [HttpPost]
        public async Task<ActionResult<BinLocationListItemDto>> Create([FromBody] CreateBinLocationRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var code = (request.BinLocation ?? string.Empty).Trim();
            var exists = await _context.BinLocations
                .AnyAsync(item => item.BinLocationName.ToLower() == code.ToLower());
            if (exists)
            {
                return Conflict("Bin location already exists.");
            }

            var now = DateTime.UtcNow;

            var entity = new BinLocation
            {
                BinLocationName = code,
                IsBinActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.BinLocations.Add(entity);
            await _context.SaveChangesAsync();

            var row = (await BuildRowsAsync(entity.IsBinActive)).FirstOrDefault(item => item.BinID == entity.BinID);
            return row == null ? NotFound() : Ok(row);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<BinLocationListItemDto>> Update(int id, [FromBody] UpdateBinLocationRequest request)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var entity = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinID == id);
            if (entity == null) return NotFound();

            var code = (request.BinLocation ?? string.Empty).Trim();
            var duplicate = await _context.BinLocations
                .AnyAsync(item => item.BinID != id && item.BinLocationName.ToLower() == code.ToLower());
            if (duplicate)
            {
                return Conflict("Bin location already exists.");
            }

            entity.BinLocationName = code;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var row = (await BuildRowsAsync(entity.IsBinActive)).FirstOrDefault(item => item.BinID == id);
            return row == null ? NotFound() : Ok(row);
        }

        [HttpPut("{id:int}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var entity = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinID == id);
            if (entity == null) return NotFound();
            entity.IsBinActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var entity = await _context.BinLocations.FirstOrDefaultAsync(item => item.BinID == id);
            if (entity == null) return NotFound();
            entity.IsBinActive = true;
            entity.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<List<BinLocationListItemDto>> BuildRowsAsync(bool isActive)
        {
            var binsQuery = _context.BinLocations
                .AsNoTracking()
                .Where(item => item.IsBinActive == isActive);

            var bins = await binsQuery
                .OrderBy(item => item.BinLocationName)
                .ToListAsync();
            if (bins.Count == 0) return new List<BinLocationListItemDto>();

            var binIds = bins.Select(item => item.BinID).ToList();
            var occupiedByBin = await _context.ProductionInventories
                .AsNoTracking()
                .Where(item => binIds.Contains(item.BinID) && item.QuantityOnHand > 0)
                .GroupBy(item => item.BinID)
                .ToDictionaryAsync(
                    group => group.Key,
                    group => new
                    {
                        Qty = group.Sum(item => item.QuantityOnHand),
                        VersionID = group.OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt).Select(item => (int?)item.VersionID).FirstOrDefault()
                    });

            return bins.Select(item =>
            {
                var hasOccupied = occupiedByBin.TryGetValue(item.BinID, out var occupied);
                return new BinLocationListItemDto
                {
                    BinID = item.BinID,
                    BinLocation = item.BinLocationName,
                    BinCode = item.BinLocationName,
                    IsBinActive = item.IsBinActive,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    OccupancyStatus = hasOccupied ? "Occupied" : "Available",
                    OccupiedQuantity = hasOccupied ? occupied!.Qty : 0m,
                    OccupiedVersionID = hasOccupied ? occupied!.VersionID : null
                };
            }).ToList();
        }
    }
}
