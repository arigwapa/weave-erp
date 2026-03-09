using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/collections")]
    public class CollectionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CollectionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Collection>>> GetAll()
        {
            var items = await _context.Collections
                .AsNoTracking()
                .Where(x => x.Status != "Archived")
                .OrderByDescending(x => x.CollectionID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<Collection>>> GetArchived()
        {
            var items = await _context.Collections
                .AsNoTracking()
                .Where(x => x.Status == "Archived")
                .OrderByDescending(x => x.CollectionID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<Collection>> GetById(int id)
        {
            var item = await _context.Collections.AsNoTracking().FirstOrDefaultAsync(x => x.CollectionID == id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<Collection>> Create([FromBody] CollectionDto dto)
        {
            if (!TryValidateDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var normalizedCode = dto.CollectionCode.Trim();
            var duplicateCode = await _context.Collections
                .AnyAsync(x => x.CollectionCode.ToLower() == normalizedCode.ToLower());
            if (duplicateCode)
            {
                ModelState.AddModelError(nameof(dto.CollectionCode), "Collection code already exists.");
                return Conflict(new ValidationProblemDetails(ModelState)
                {
                    Status = 409,
                    Title = "Validation failed."
                });
            }

            var actorUserId = GetActorUserId() ?? 1;
            var item = new Collection
            {
                CollectionCode = normalizedCode,
                CollectionName = dto.CollectionName.Trim(),
                Season = dto.Season.Trim(),
                TargetLaunchDate = dto.TargetLaunchDate,
                Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
                Status = "Draft",
                CreatedByUserID = actorUserId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Collections.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = item.CollectionID }, item);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<Collection>> Update(int id, [FromBody] UpdateCollectionRequest request)
        {
            var item = await _context.Collections.FirstOrDefaultAsync(x => x.CollectionID == id);
            if (item == null)
            {
                return NotFound();
            }

            var dto = new CollectionDto
            {
                CollectionCode = request.CollectionCode?.Trim() ?? item.CollectionCode,
                CollectionName = request.CollectionName?.Trim() ?? item.CollectionName,
                Season = request.Season?.Trim() ?? item.Season,
                TargetLaunchDate = request.TargetLaunchDate ?? item.TargetLaunchDate,
                Notes = request.Notes ?? item.Notes
            };

            if (!TryValidateDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var duplicateCode = await _context.Collections
                .AnyAsync(x =>
                    x.CollectionID != id &&
                    x.CollectionCode.ToLower() == dto.CollectionCode.ToLower());
            if (duplicateCode)
            {
                ModelState.AddModelError(nameof(request.CollectionCode), "Collection code already exists.");
                return Conflict(new ValidationProblemDetails(ModelState)
                {
                    Status = 409,
                    Title = "Validation failed."
                });
            }

            item.CollectionCode = dto.CollectionCode;
            item.CollectionName = dto.CollectionName;
            item.Season = dto.Season;
            item.TargetLaunchDate = dto.TargetLaunchDate;
            item.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                item.Status = request.Status.Trim();
            }

            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(item);
        }

        [HttpPut("{id:int}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var item = await _context.Collections.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = "Archived";
            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var item = await _context.Collections.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = "Draft";
            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private int? GetActorUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }

        private bool TryValidateDto(CollectionDto dto)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(dto);
            var isValid = Validator.TryValidateObject(dto, context, results, validateAllProperties: true);
            if (isValid)
            {
                return true;
            }

            foreach (var result in results)
            {
                var members = result.MemberNames?.Any() == true
                    ? result.MemberNames
                    : new[] { string.Empty };
                foreach (var member in members)
                {
                    ModelState.AddModelError(member, result.ErrorMessage ?? "Invalid value.");
                }
            }

            return false;
        }
    }

    public class UpdateCollectionRequest
    {
        [StringLength(50, ErrorMessage = "Collection code must be at most 50 characters.")]
        public string? CollectionCode { get; set; }

        [StringLength(160, ErrorMessage = "Collection name must be at most 160 characters.")]
        public string? CollectionName { get; set; }

        [StringLength(60, ErrorMessage = "Season must be at most 60 characters.")]
        public string? Season { get; set; }

        public DateTime? TargetLaunchDate { get; set; }

        [StringLength(1000, ErrorMessage = "Notes must be at most 1000 characters.")]
        public string? Notes { get; set; }

        [StringLength(40, ErrorMessage = "Status must be at most 40 characters.")]
        public string? Status { get; set; }
    }
}
