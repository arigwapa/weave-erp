using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/materials")]
    public class MaterialsController : GenericCrudController<Material>
    {
        private readonly AppDbContext _context;

        public MaterialsController(AppDbContext context) : base(context, "MaterialID")
        {
            _context = context;
        }

        [HttpGet]
        public override async Task<ActionResult<IEnumerable<Material>>> GetAll()
        {
            var items = await _context.Materials
                .AsNoTracking()
                .OrderByDescending(x => x.MaterialID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public override async Task<ActionResult<Material>> Create(Material entity)
        {
            var dto = new MaterialDto
            {
                Name = entity.Name?.Trim() ?? string.Empty,
                Type = entity.Type?.Trim() ?? string.Empty,
                Unit = entity.Unit?.Trim() ?? string.Empty,
                UnitCost = entity.UnitCost,
                SupplierName = entity.SupplierName?.Trim(),
                Notes = entity.Notes?.Trim(),
                Status = NormalizeMaterialStatus(entity.Status, "Active"),
            };

            if (!TryValidateMaterialDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var actorUserId = GetActorUserId() ?? 1;
            entity.Name = dto.Name;
            entity.Type = dto.Type;
            entity.Unit = dto.Unit;
            entity.UnitCost = dto.UnitCost;
            entity.SupplierName = string.IsNullOrWhiteSpace(dto.SupplierName) ? null : dto.SupplierName.Trim();
            entity.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
            entity.Status = dto.Status;
            entity.CreatedByUserID = actorUserId;
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedByUserID = null;
            entity.UpdatedAt = null;

            _context.Materials.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = entity.MaterialID }, entity);
        }

        [HttpPut("{id:int}")]
        public override async Task<IActionResult> Update(int id, Material entity)
        {
            var item = await _context.Materials.FirstOrDefaultAsync(x => x.MaterialID == id);
            if (item == null)
            {
                return NotFound();
            }

            var dto = new MaterialDto
            {
                Name = entity.Name?.Trim() ?? string.Empty,
                Type = entity.Type?.Trim() ?? string.Empty,
                Unit = entity.Unit?.Trim() ?? string.Empty,
                UnitCost = entity.UnitCost,
                SupplierName = entity.SupplierName?.Trim(),
                Notes = entity.Notes?.Trim(),
                Status = NormalizeMaterialStatus(entity.Status, item.Status),
            };

            if (!TryValidateMaterialDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            item.Name = dto.Name;
            item.Type = dto.Type;
            item.Unit = dto.Unit;
            item.UnitCost = dto.UnitCost;
            item.SupplierName = string.IsNullOrWhiteSpace(dto.SupplierName) ? null : dto.SupplierName.Trim();
            item.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
            item.Status = dto.Status;
            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<Material>>> GetArchived()
        {
            var items = await _context.Materials
                .AsNoTracking()
                .Where(x => x.Status == "Inactive")
                .OrderByDescending(x => x.MaterialID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPut("{id:int}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var item = await _context.Materials.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = "Inactive";
            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)
            {
                ModelState.AddModelError(nameof(item.Status), "Material status is invalid.");
                return ValidationProblem(ModelState);
            }
        }

        [HttpPut("{id:int}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var item = await _context.Materials.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            item.Status = "Active";
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

        private bool TryValidateMaterialDto(MaterialDto dto)
        {
            var results = new List<ValidationResult>();
            var context = new ValidationContext(dto);
            Validator.TryValidateObject(dto, context, results, validateAllProperties: true);

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

            if (!string.Equals(dto.Status, "Active", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(dto.Status, "Inactive", StringComparison.OrdinalIgnoreCase))
            {
                ModelState.AddModelError(nameof(dto.Status), "Status must be either Active or Inactive.");
            }

            return ModelState.ErrorCount == 0;
        }

        private static string NormalizeMaterialStatus(string? rawStatus, string fallback)
        {
            var normalized = string.IsNullOrWhiteSpace(rawStatus) ? fallback : rawStatus.Trim();
            if (string.Equals(normalized, "Archived", StringComparison.OrdinalIgnoreCase))
            {
                return "Inactive";
            }
            if (string.Equals(normalized, "Active", StringComparison.OrdinalIgnoreCase))
            {
                return "Active";
            }
            if (string.Equals(normalized, "Inactive", StringComparison.OrdinalIgnoreCase))
            {
                return "Inactive";
            }
            return normalized;
        }
    }
}
