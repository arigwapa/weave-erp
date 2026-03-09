using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/finance/costing-workbench")]
    public class FinanceCostingWorkbenchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FinanceCostingWorkbenchController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("queue")]
        public async Task<ActionResult<IEnumerable<FinanceCostingCollectionDto>>> GetQueue()
        {
            var collections = await _context.Collections
                .AsNoTracking()
                .Where(c =>
                    c.Status.ToLower().Contains("submitted to finance") ||
                    c.Status.ToLower().Contains("for budget planning"))
                .OrderByDescending(c => c.CollectionID)
                .ToListAsync();

            if (collections.Count == 0)
            {
                return Ok(Array.Empty<FinanceCostingCollectionDto>());
            }

            var seasons = collections
                .Select(c => c.Season.Trim().ToLower())
                .Distinct()
                .ToList();

            var products = await _context.Products
                .AsNoTracking()
                .Where(p => seasons.Contains(p.Season.Trim().ToLower()) && p.Status != "Archived")
                .OrderByDescending(p => p.ProductID)
                .ToListAsync();

            var productIds = products.Select(p => p.ProductID).ToList();
            var bomLines = await _context.BillOfMaterials
                .AsNoTracking()
                .Where(b => productIds.Contains(b.ProductID))
                .OrderByDescending(b => b.BOMID)
                .ToListAsync();

            var bomByProduct = bomLines
                .GroupBy(line => line.ProductID)
                .ToDictionary(group => group.Key, group => group.ToList());

            var result = collections.Select(collection =>
            {
                var collectionProducts = products
                    .Where(product => string.Equals(product.Season?.Trim(), collection.Season?.Trim(), StringComparison.OrdinalIgnoreCase))
                    .Select(product =>
                    {
                        var lines = bomByProduct.TryGetValue(product.ProductID, out var found)
                            ? found
                            : new List<Models.BillOfMaterials>();
                        var mappedLines = lines.Select(line => new FinanceCostingBomLineDto
                        {
                            BillOfMaterialsID = line.BOMID,
                            MaterialName = line.MaterialName,
                            QtyRequired = line.QtyRequired,
                            Unit = line.Unit,
                            UnitCost = line.UnitCost
                        }).ToList();
                        var isApproved = string.Equals(product.ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase);
                        var costingStatus = isApproved
                            ? "Validated"
                            : mappedLines.Count > 0
                                ? "For Review"
                                : "Draft";

                        return new FinanceCostingProductDto
                        {
                            ProductID = product.ProductID,
                            SKU = product.SKU,
                            Name = product.Name,
                            SizeProfile = product.SizeProfile,
                            ApprovalStatus = product.ApprovalStatus ?? string.Empty,
                            CostingStatus = costingStatus,
                            BomVersion = mappedLines.Count > 0 ? "V1" : "-",
                            TotalCost = mappedLines.Sum(line => line.QtyRequired * line.UnitCost) * Math.Max(1, product.Quantity),
                            BomLines = mappedLines
                        };
                    })
                    .ToList();

                var allValidated = collectionProducts.Count > 0 && collectionProducts.All(p => p.CostingStatus == "Validated");
                var collectionCostingStatus = collection.Status.Equals("For Budget Planning", StringComparison.OrdinalIgnoreCase)
                    ? "For Budget Planning"
                    : allValidated
                        ? "Validated"
                        : collectionProducts.Any(p => p.CostingStatus == "For Review")
                            ? "For Review"
                            : "Draft";

                return new FinanceCostingCollectionDto
                {
                    CollectionID = collection.CollectionID,
                    CollectionCode = collection.CollectionCode,
                    CollectionName = collection.CollectionName,
                    Status = collection.Status,
                    CostingStatus = collectionCostingStatus,
                    TotalBudgetNeeded = collectionProducts.Sum(p => p.TotalCost),
                    ProductCount = collectionProducts.Count,
                    BomLineCount = collectionProducts.Sum(p => p.BomLines.Count),
                    Products = collectionProducts
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPut("products/{productId:int}/approve")]
        public async Task<ActionResult<FinanceCostingProductDto>> ApproveProduct(
            int productId,
            [FromBody] ApproveFinanceCostingProductRequest? request)
        {
            var payload = request ?? new ApproveFinanceCostingProductRequest();
            if (!TryValidateDto(payload))
            {
                return ValidationProblem(ModelState);
            }

            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductID == productId);
            if (product == null)
            {
                return NotFound();
            }

            product.ApprovalStatus = string.IsNullOrWhiteSpace(payload.ApprovalStatus)
                ? "Approved"
                : payload.ApprovalStatus.Trim();
            product.UpdatedByUserID = GetActorUserId();
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var lines = await _context.BillOfMaterials
                .AsNoTracking()
                .Where(line => line.ProductID == productId)
                .ToListAsync();

            return Ok(new FinanceCostingProductDto
            {
                ProductID = product.ProductID,
                SKU = product.SKU,
                Name = product.Name,
                SizeProfile = product.SizeProfile,
                ApprovalStatus = product.ApprovalStatus ?? string.Empty,
                CostingStatus = "Validated",
                BomVersion = lines.Count > 0 ? "V1" : "-",
                TotalCost = lines.Sum(line => line.QtyRequired * line.UnitCost) * Math.Max(1, product.Quantity),
                BomLines = lines.Select(line => new FinanceCostingBomLineDto
                {
                    BillOfMaterialsID = line.BOMID,
                    MaterialName = line.MaterialName,
                    QtyRequired = line.QtyRequired,
                    Unit = line.Unit,
                    UnitCost = line.UnitCost
                }).ToList()
            });
        }

        [HttpPut("collections/{collectionId:int}/approve")]
        public async Task<ActionResult<FinanceCostingCollectionDto>> ApproveCollection(
            int collectionId,
            [FromBody] ApproveFinanceCostingCollectionRequest? request)
        {
            var payload = request ?? new ApproveFinanceCostingCollectionRequest();
            if (!TryValidateDto(payload))
            {
                return ValidationProblem(ModelState);
            }

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.CollectionID == collectionId);
            if (collection == null)
            {
                return NotFound();
            }

            var relatedProducts = await _context.Products
                .Where(p => p.Season.ToLower() == collection.Season.ToLower() && p.Status != "Archived")
                .ToListAsync();

            if (relatedProducts.Count == 0 || relatedProducts.Any(product => !string.Equals(product.ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase)))
            {
                ModelState.AddModelError("Products", "All products in this collection must be approved first.");
                return ValidationProblem(ModelState);
            }

            collection.Status = payload.Status.Trim();
            collection.UpdatedByUserID = GetActorUserId();
            collection.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new FinanceCostingCollectionDto
            {
                CollectionID = collection.CollectionID,
                CollectionCode = collection.CollectionCode,
                CollectionName = collection.CollectionName,
                Status = collection.Status,
                CostingStatus = "For Budget Planning",
                ProductCount = relatedProducts.Count
            });
        }

        private int? GetActorUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var id) ? id : null;
        }

        private bool TryValidateDto(object dto)
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
