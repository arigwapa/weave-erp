using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/branch-requests")]
    public class BranchRequestsController : GenericCrudController<BranchRequest>
    {
        private readonly AppDbContext _context;

        public BranchRequestsController(AppDbContext context) : base(context, "RequestID")
        {
            _context = context;
        }

        [HttpGet("products")]
        public async Task<ActionResult<IEnumerable<object>>> Products()
        {
            var items = await (from p in _context.Products.AsNoTracking()
                               where p.Status != "Archived"
                               select new
                               {
                                   ProductID = p.ProductID,
                                   ProductName = p.Name,
                                   SKU = p.SKU,
                                   AvailableQty = p.Quantity,
                                   BranchStockQty = 0
                               }).ToListAsync();
            return Ok(items);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<object>>> MyRequests()
        {
            var userId = GetCurrentUserId();
            var query = _context.BranchRequests.AsNoTracking().AsQueryable();
            if (userId > 0)
            {
                query = query.Where(x => x.RequestedByUserID == userId);
            }

            var requests = await query.OrderByDescending(x => x.RequestID).ToListAsync();
            var requestIds = requests.Select(x => x.RequestID).ToList();
            var items = await _context.BranchRequestItems
                .AsNoTracking()
                .Where(i => requestIds.Contains(i.RequestID))
                .ToListAsync();
            var versions = await _context.ProductionVersions.AsNoTracking().ToListAsync();
            var products = await _context.Products.AsNoTracking().ToListAsync();

            var payload = requests.Select(r => new
            {
                r.RequestID,
                r.Status,
                RequestedAt = r.RequestedAt,
                Items = items.Where(i => i.RequestID == r.RequestID).Select(i =>
                {
                    var version = versions.FirstOrDefault(v => v.VersionID == i.VersionID);
                    var product = version != null ? products.FirstOrDefault(p => p.ProductID == version.ProductID) : null;
                    var productName = product?.Name ?? $"Version {i.VersionID}";
                    return new
                    {
                        i.RequestItemID,
                        i.VersionID,
                        ProductName = productName,
                        VersionNumber = version?.VersionNumber ?? "-",
                        QtyRequested = i.QtyRequested
                    };
                })
            });

            return Ok(payload);
        }

        [HttpPost]
        public override async Task<ActionResult<BranchRequest>> Create(BranchRequest entity)
        {
            entity.Status = string.IsNullOrWhiteSpace(entity.Status) ? "Requested" : entity.Status;
            entity.RequestedAt = entity.RequestedAt == default ? DateTime.UtcNow : entity.RequestedAt;
            entity.CreatedAt = entity.CreatedAt == default ? DateTime.UtcNow : entity.CreatedAt;
            return await base.Create(entity);
        }

        [HttpPost("portal")]
        public async Task<ActionResult<object>> CreatePortal([FromBody] CreateBranchRequestDto dto)
        {
            if (dto == null || dto.Items == null || dto.Items.Count == 0)
            {
                return BadRequest("At least one request item is required.");
            }

            var userId = GetCurrentUserId();
            var branchExists = await _context.Branches
                .AsNoTracking()
                .AnyAsync(b => b.BranchID == dto.BranchId);
            var regionId = dto.RegionId > 0
                ? dto.RegionId
                : await _context.Regions
                    .AsNoTracking()
                    .OrderBy(r => r.RegionID)
                    .Select(r => r.RegionID)
                    .FirstOrDefaultAsync();
            if (!branchExists || regionId <= 0)
            {
                return BadRequest("Invalid branch or region.");
            }
            var request = new BranchRequest
            {
                BranchID = dto.BranchId,
                RegionID = regionId,
                RequestedByUserID = userId > 0 ? userId : 1,
                Status = "Requested",
                RequestedAt = DateTime.UtcNow,
                Notes = dto.Notes,
                CreatedByUserID = userId > 0 ? userId : 1,
                CreatedAt = DateTime.UtcNow
            };
            _context.BranchRequests.Add(request);
            await _context.SaveChangesAsync();

            var items = dto.Items.Select(i => new BranchRequestItem
            {
                RequestID = request.RequestID,
                VersionID = i.VersionId,
                QtyRequested = i.QtyRequested,
                CreatedByUserID = userId > 0 ? userId : 1,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.BranchRequestItems.AddRange(items);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                request.RequestID,
                request.Status,
                request.RequestedAt,
                Items = items.Select(i => new { i.RequestItemID, i.VersionID, i.QtyRequested })
            });
        }

        [HttpPost("{id:int}/approve")]
        public async Task<ActionResult<BranchRequest>> Approve(int id, [FromBody] NotesDto dto)
        {
            return await Transition(id, "Under Review", "Scheduled", dto?.Notes);
        }

        [HttpPost("{id:int}/reject")]
        public async Task<ActionResult<BranchRequest>> Reject(int id, [FromBody] NotesDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Notes))
            {
                return BadRequest("Rejection reason is required.");
            }

            return await Transition(id, "Under Review", "Rejected", dto.Notes);
        }

        [HttpPost("{id:int}/review")]
        public async Task<ActionResult<BranchRequest>> Review(int id)
        {
            return await Transition(id, "Requested", "Under Review");
        }

        [HttpPost("{id:int}/schedule")]
        public async Task<ActionResult<BranchRequest>> Schedule(int id)
        {
            return await Transition(id, "Under Review", "Scheduled");
        }

        [HttpPost("{id:int}/mark-in-transit")]
        public async Task<ActionResult<BranchRequest>> MarkInTransit(int id)
        {
            return await Transition(id, "Scheduled", "In Transit");
        }

        [HttpPost("{id:int}/receive")]
        public async Task<ActionResult<BranchRequest>> Receive(int id)
        {
            return await Transition(id, "In Transit", "Received");
        }

        [HttpPost("{id:int}/mark-waiting-production")]
        public async Task<ActionResult<BranchRequest>> MarkWaitingProduction(int id, [FromBody] WaitingProductionDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Payload is required.");
            }

            var item = await _context.BranchRequests.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            if (Normalize(item.Status) != Normalize("Under Review"))
            {
                return BadRequest($"Request cannot be marked waiting production from '{item.Status}'.");
            }

            item.Status = "Under Review";
            item.Notes = $"In production. ETA {dto.EtaBusinessDays} business days. {dto.Message}".Trim();
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        private async Task<ActionResult<BranchRequest>> Transition(int id, string from, string to, string? notes = null)
        {
            var item = await _context.BranchRequests.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            if (Normalize(item.Status) != Normalize(from))
            {
                return BadRequest($"Request cannot transition to '{to}' from '{item.Status}'.");
            }

            item.Status = to;
            if (!string.IsNullOrWhiteSpace(notes))
            {
                item.Notes = notes;
            }
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        private int GetCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : 0;
        }

        private static string Normalize(string? value)
        {
            return (value ?? string.Empty).Trim().Replace(" ", string.Empty).ToLowerInvariant();
        }
    }

    public class WaitingProductionDto
    {
        public int EtaBusinessDays { get; set; }
        public string? Message { get; set; }
    }

    public class NotesDto
    {
        public string? Notes { get; set; }
    }

    public class CreateBranchRequestDto
    {
        public int BranchId { get; set; }
        public int RegionId { get; set; }
        public string? Notes { get; set; }
        public List<CreateBranchRequestItemDto> Items { get; set; } = new();
    }

    public class CreateBranchRequestItemDto
    {
        public int VersionId { get; set; }
        public int QtyRequested { get; set; }
    }
}
