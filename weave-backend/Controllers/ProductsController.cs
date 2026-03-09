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
    [Route("api/products")]
    public class ProductsController : GenericCrudController<Product>
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context) : base(context, "ProductID")
        {
            _context = context;
        }

        [HttpGet]
        public override async Task<ActionResult<IEnumerable<Product>>> GetAll()
        {
            var items = await _context.Products
                .AsNoTracking()
                .Where(x => x.Status != "Archived")
                .OrderByDescending(x => x.ProductID)
                .ToListAsync();
            return Ok(items);
        }

        [HttpPost]
        public override async Task<ActionResult<Product>> Create(Product entity)
        {
            var dto = new ProductDto
            {
                SKU = entity.SKU?.Trim() ?? string.Empty,
                Name = entity.Name?.Trim() ?? string.Empty,
                Category = entity.Category?.Trim() ?? string.Empty,
                ImageUrl = entity.ImageUrl?.Trim(),
                DesignNotes = entity.DesignNotes?.Trim() ?? string.Empty,
                ManufacturingInstructions = entity.ManufacturingInstructions?.Trim() ?? string.Empty,
                SizeProfile = entity.SizeProfile?.Trim() ?? string.Empty,
                Season = entity.Season?.Trim() ?? string.Empty,
                Quantity = entity.Quantity,
                Status = string.IsNullOrWhiteSpace(entity.Status) ? "Draft" : entity.Status.Trim(),
                ApprovalStatus = entity.ApprovalStatus?.Trim(),
            };
            if (!TryValidateProductDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var duplicate = await _context.Products
                .AnyAsync(x => x.SKU.ToLower() == dto.SKU.ToLower());
            if (duplicate)
            {
                ModelState.AddModelError(nameof(dto.SKU), "SKU already exists.");
                return Conflict(new ValidationProblemDetails(ModelState)
                {
                    Status = 409,
                    Title = "Validation failed."
                });
            }

            var actorUserId = GetActorUserId() ?? 1;
            entity.SKU = dto.SKU;
            entity.Name = dto.Name;
            entity.Category = dto.Category;
            entity.ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim();
            entity.DesignNotes = dto.DesignNotes;
            entity.ManufacturingInstructions = dto.ManufacturingInstructions;
            entity.SizeProfile = dto.SizeProfile;
            entity.Season = dto.Season;
            entity.Quantity = dto.Quantity;
            entity.Status = dto.Status;
            entity.ApprovalStatus = dto.ApprovalStatus;
            entity.CreatedByUserID = actorUserId;
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedByUserID = null;
            entity.UpdatedAt = null;

            _context.Products.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = entity.ProductID }, entity);
        }

        [HttpPut("{id:int}")]
        public override async Task<IActionResult> Update(int id, Product entity)
        {
            var item = await _context.Products.FirstOrDefaultAsync(x => x.ProductID == id);
            if (item == null)
            {
                return NotFound();
            }

            var dto = new ProductDto
            {
                SKU = entity.SKU?.Trim() ?? string.Empty,
                Name = entity.Name?.Trim() ?? string.Empty,
                Category = entity.Category?.Trim() ?? string.Empty,
                ImageUrl = entity.ImageUrl?.Trim(),
                DesignNotes = entity.DesignNotes?.Trim() ?? string.Empty,
                ManufacturingInstructions = entity.ManufacturingInstructions?.Trim() ?? string.Empty,
                SizeProfile = entity.SizeProfile?.Trim() ?? string.Empty,
                Season = entity.Season?.Trim() ?? string.Empty,
                Quantity = entity.Quantity,
                Status = string.IsNullOrWhiteSpace(entity.Status) ? item.Status : entity.Status.Trim(),
                ApprovalStatus = entity.ApprovalStatus?.Trim(),
            };
            if (!TryValidateProductDto(dto))
            {
                return ValidationProblem(ModelState);
            }

            var duplicate = await _context.Products
                .AnyAsync(x => x.ProductID != id && x.SKU.ToLower() == dto.SKU.ToLower());
            if (duplicate)
            {
                ModelState.AddModelError(nameof(dto.SKU), "SKU already exists.");
                return Conflict(new ValidationProblemDetails(ModelState)
                {
                    Status = 409,
                    Title = "Validation failed."
                });
            }

            item.SKU = dto.SKU;
            item.Name = dto.Name;
            item.Category = dto.Category;
            item.ImageUrl = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim();
            item.DesignNotes = dto.DesignNotes;
            item.ManufacturingInstructions = dto.ManufacturingInstructions;
            item.SizeProfile = dto.SizeProfile;
            item.Season = dto.Season;
            item.Quantity = dto.Quantity;
            item.Status = dto.Status;
            item.ApprovalStatus = dto.ApprovalStatus;
            item.UpdatedByUserID = GetActorUserId();
            item.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<Product>>> GetArchived()
        {
            var items = await _context.Products
                .Where(x => x.Status == "Archived")
                .ToListAsync();
            return Ok(items);
        }

        [HttpPut("{id:int}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var item = await _context.Products.FindAsync(id);
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
            var item = await _context.Products.FindAsync(id);
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

        private bool TryValidateProductDto(ProductDto dto)
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
