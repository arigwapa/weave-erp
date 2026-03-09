using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    public class BillOfMaterialsController : GenericCrudController<BillOfMaterials>
    {
        private readonly AppDbContext _context;

        public BillOfMaterialsController(AppDbContext context) : base(context, "BOMID")
        {
            _context = context;
        }

        [HttpGet]
        public override async Task<ActionResult<IEnumerable<BillOfMaterials>>> GetAll()
        {
            var items = await _context.BillOfMaterials
                .AsNoTracking()
                .OrderByDescending(x => x.BOMID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public override async Task<ActionResult<BillOfMaterials>> Create(BillOfMaterials entity)
        {
            var dto = new BillOfMaterialsDto
            {
                ProductID = entity.ProductID,
                MaterialName = entity.MaterialName?.Trim() ?? string.Empty,
                QtyRequired = entity.QtyRequired,
                Unit = entity.Unit?.Trim() ?? string.Empty,
                UnitCost = entity.UnitCost,
            };

            if (!TryValidateBillOfMaterialsDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var productExists = await _context.Products.AnyAsync(x => x.ProductID == dto.ProductID);
            if (!productExists)
            {
                ModelState.AddModelError(nameof(dto.ProductID), "Product does not exist.");
                return ValidationProblem(ModelState);
            }

            entity.ProductID = dto.ProductID;
            entity.MaterialName = dto.MaterialName;
            entity.QtyRequired = dto.QtyRequired;
            entity.Unit = dto.Unit;
            entity.UnitCost = dto.UnitCost;
            entity.CreatedByUserID = GetActorUserId() ?? 1;
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedByUserID = null;
            entity.UpdatedAt = null;

            _context.BillOfMaterials.Add(entity);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                ModelState.AddModelError(string.Empty, "Failed to create BOM line due to a database constraint.");
                return ValidationProblem(ModelState);
            }
            return CreatedAtAction(nameof(GetById), new { id = entity.BOMID }, entity);
        }

        [HttpPut("{id:int}")]
        public override async Task<IActionResult> Update(int id, BillOfMaterials entity)
        {
            var item = await _context.BillOfMaterials.FirstOrDefaultAsync(x => x.BOMID == id);
            if (item == null)
            {
                return NotFound();
            }

            var dto = new BillOfMaterialsDto
            {
                ProductID = entity.ProductID > 0 ? entity.ProductID : item.ProductID,
                MaterialName = !string.IsNullOrWhiteSpace(entity.MaterialName) ? entity.MaterialName.Trim() : item.MaterialName,
                QtyRequired = entity.QtyRequired,
                Unit = entity.Unit?.Trim() ?? string.Empty,
                UnitCost = entity.UnitCost,
            };

            if (!TryValidateBillOfMaterialsDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var productExists = await _context.Products.AnyAsync(x => x.ProductID == dto.ProductID);
            if (!productExists)
            {
                ModelState.AddModelError(nameof(dto.ProductID), "Product does not exist.");
                return ValidationProblem(ModelState);
            }

            item.ProductID = dto.ProductID;
            item.MaterialName = dto.MaterialName;
            item.QtyRequired = dto.QtyRequired;
            item.Unit = dto.Unit;
            item.UnitCost = dto.UnitCost;
            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                ModelState.AddModelError(string.Empty, "Failed to update BOM line due to a database constraint.");
                return ValidationProblem(ModelState);
            }
            return NoContent();
        }

        private int? GetActorUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }

        private bool TryValidateBillOfMaterialsDto(BillOfMaterialsDto dto)
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
}
