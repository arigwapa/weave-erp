using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/admin/approval-inbox")]
    public class AdminApprovalInboxController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminApprovalInboxController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("finance")]
        public async Task<ActionResult<IEnumerable<AdminApprovalFinanceItemDto>>> GetFinanceQueue()
        {
            var collections = await _context.Collections
                .AsNoTracking()
                .Where(c =>
                    c.Status.ToLower().Contains("submitted to admin") ||
                    c.Status.ToLower().Contains("returned to product manager") ||
                    c.Status.ToLower().Contains("released to production"))
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .ToListAsync();

            if (collections.Count == 0)
            {
                return Ok(Array.Empty<AdminApprovalFinanceItemDto>());
            }

            var userMap = await _context.Users
                .AsNoTracking()
                .ToDictionaryAsync(user => user.UserID, user => user.Username);

            var seasons = collections.Select(c => c.Season.Trim().ToLower()).Distinct().ToList();
            var products = await _context.Products
                .AsNoTracking()
                .Where(p => seasons.Contains(p.Season.Trim().ToLower()) && p.Status != "Archived")
                .OrderByDescending(p => p.ProductID)
                .ToListAsync();
            var productIds = products.Select(p => p.ProductID).ToList();
            var bomLines = await _context.BillOfMaterials
                .AsNoTracking()
                .Where(line => productIds.Contains(line.ProductID))
                .ToListAsync();
            var planMap = await _context.CollectionBudgetPlans
                .AsNoTracking()
                .Where(plan => collections.Select(c => c.CollectionID).Contains(plan.CollectionID))
                .ToDictionaryAsync(plan => plan.CollectionID);

            var bomByProduct = bomLines
                .GroupBy(line => line.ProductID)
                .ToDictionary(group => group.Key, group => group.ToList());

            var result = collections.Select(collection =>
            {
                var matchedProducts = products
                    .Where(product =>
                        string.Equals(product.Season?.Trim(), collection.Season?.Trim(), StringComparison.OrdinalIgnoreCase))
                    .Select(product =>
                    {
                        var lines = bomByProduct.TryGetValue(product.ProductID, out var found)
                            ? found
                            : new List<BillOfMaterials>();
                        return new AdminApprovalProductDto
                        {
                            ProductID = product.ProductID,
                            SKU = product.SKU,
                            Name = product.Name,
                            SizeProfile = product.SizeProfile,
                            ApprovalStatus = product.ApprovalStatus ?? string.Empty,
                            TotalCost = lines.Sum(line => line.QtyRequired * line.UnitCost) * Math.Max(1, product.Quantity),
                            BomLines = lines.Select(line => new AdminApprovalBomLineDto
                            {
                                BOMID = line.BOMID,
                                MaterialName = line.MaterialName,
                                QtyRequired = line.QtyRequired,
                                Unit = line.Unit,
                                UnitCost = line.UnitCost
                            }).ToList()
                        };
                    })
                    .ToList();

                var plan = planMap.TryGetValue(collection.CollectionID, out var foundPlan) ? foundPlan : null;
                var submittedBy = collection.UpdatedByUserID.HasValue && userMap.TryGetValue(collection.UpdatedByUserID.Value, out var updatedUser)
                    ? updatedUser
                    : collection.CreatedByUserID.HasValue && userMap.TryGetValue(collection.CreatedByUserID.Value, out var createdUser)
                        ? createdUser
                        : "Finance Team";

                return new AdminApprovalFinanceItemDto
                {
                    CollectionID = collection.CollectionID,
                    PackageID = $"FP-{DateTime.UtcNow.Year}-{collection.CollectionID:000}",
                    CollectionCode = collection.CollectionCode,
                    CollectionName = collection.CollectionName,
                    Season = collection.Season,
                    SubmittedAt = (collection.UpdatedAt ?? collection.CreatedAt).ToString("O"),
                    SubmittedBy = submittedBy,
                    Status = MapAdminQueueStatus(collection.Status, plan?.AdminDecision),
                    TotalBomCost = matchedProducts.Sum(product => product.TotalCost),
                    RecommendedBudget = plan?.BudgetCap ?? matchedProducts.Sum(product => product.TotalCost),
                    ContingencyPercent = plan?.ContingencyPercent ?? 0m,
                    FinanceNotes = plan?.Notes ?? string.Empty,
                    AdminDecision = plan?.AdminDecision ?? string.Empty,
                    AdminDecisionReason = plan?.AdminDecisionReason ?? string.Empty,
                    SentToProductManager = plan?.SentToProductManager ?? false,
                    SentToProductionManager = plan?.SentToProductionManager ?? false,
                    Products = matchedProducts
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPut("finance/{collectionId:int}/decision")]
        public async Task<ActionResult<AdminApprovalFinanceItemDto>> SubmitFinanceDecision(
            int collectionId,
            [FromBody] AdminFinanceDecisionRequest request)
        {
            if (!TryValidateDto(request))
            {
                return ValidationProblem(ModelState);
            }

            var normalizedDecision = (request.Decision ?? string.Empty).Trim().ToLowerInvariant();
            if (normalizedDecision != "approve" && normalizedDecision != "reject" && normalizedDecision != "revision")
            {
                ModelState.AddModelError(nameof(request.Decision), "Decision must be Approve, Reject, or Revision.");
                return ValidationProblem(ModelState);
            }

            if ((normalizedDecision == "reject" || normalizedDecision == "revision") &&
                string.IsNullOrWhiteSpace(request.Reason))
            {
                ModelState.AddModelError(nameof(request.Reason), "Reason is required for Reject or Revision.");
                return ValidationProblem(ModelState);
            }

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.CollectionID == collectionId);
            if (collection == null)
            {
                return NotFound();
            }

            var actorUserId = GetActorUserId() ?? 1;
            var plan = await _context.CollectionBudgetPlans.FirstOrDefaultAsync(p => p.CollectionID == collectionId);
            if (plan == null)
            {
                plan = new CollectionBudgetPlan
                {
                    CollectionID = collectionId,
                    CreatedByUserID = actorUserId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CollectionBudgetPlans.Add(plan);
            }

            if (normalizedDecision == "approve")
            {
                plan.AdminDecision = "Approved";
                plan.AdminDecisionReason = string.IsNullOrWhiteSpace(request.Reason) ? null : request.Reason.Trim();
                plan.AdminDecisionAt = DateTime.UtcNow;
                plan.SentToProductionManager = true;
                plan.SentToProductManager = false;
                collection.Status = "Released to Production";
                await RebuildPendingOrdersForCollection(collection);
            }
            else if (normalizedDecision == "revision")
            {
                plan.AdminDecision = "Revision Requested";
                plan.AdminDecisionReason = request.Reason?.Trim();
                plan.AdminDecisionAt = DateTime.UtcNow;
                plan.SentToProductManager = true;
                plan.SentToProductionManager = false;
                collection.Status = "Returned to Product Manager - Revision";
            }
            else
            {
                plan.AdminDecision = "Rejected";
                plan.AdminDecisionReason = request.Reason?.Trim();
                plan.AdminDecisionAt = DateTime.UtcNow;
                plan.SentToProductManager = true;
                plan.SentToProductionManager = false;
                collection.Status = "Returned to Product Manager - Rejected";
            }

            plan.UpdatedByUserID = actorUserId;
            plan.UpdatedAt = DateTime.UtcNow;
            collection.UpdatedByUserID = actorUserId;
            collection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new AdminApprovalFinanceItemDto
            {
                CollectionID = collection.CollectionID,
                PackageID = $"FP-{DateTime.UtcNow.Year}-{collection.CollectionID:000}",
                CollectionCode = collection.CollectionCode,
                CollectionName = collection.CollectionName,
                Season = collection.Season,
                SubmittedAt = (collection.UpdatedAt ?? collection.CreatedAt).ToString("O"),
                SubmittedBy = "Admin",
                Status = MapAdminQueueStatus(collection.Status, plan.AdminDecision),
                RecommendedBudget = plan.BudgetCap,
                ContingencyPercent = plan.ContingencyPercent,
                FinanceNotes = plan.Notes ?? string.Empty,
                AdminDecision = plan.AdminDecision ?? string.Empty,
                AdminDecisionReason = plan.AdminDecisionReason ?? string.Empty,
                SentToProductManager = plan.SentToProductManager,
                SentToProductionManager = plan.SentToProductionManager
            });
        }

        [HttpPost("backfill-production-orders")]
        public async Task<ActionResult<object>> BackfillProductionOrders()
        {
            var approvedCollectionIds = await _context.CollectionBudgetPlans
                .AsNoTracking()
                .Where(plan => (plan.AdminDecision ?? string.Empty).ToLower() == "approved")
                .Select(plan => plan.CollectionID)
                .Distinct()
                .ToListAsync();

            var approvedCollections = await _context.Collections
                .Where(collection =>
                    approvedCollectionIds.Contains(collection.CollectionID) ||
                    (collection.Status ?? string.Empty).ToLower().Contains("released to production"))
                .ToListAsync();

            var inserted = 0;
            foreach (var collection in approvedCollections)
            {
                inserted += await RebuildPendingOrdersForCollection(collection);
            }

            await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = "Backfill completed.",
                CollectionsProcessed = approvedCollections.Count,
                OrdersInserted = inserted
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

        private async Task<int> RebuildPendingOrdersForCollection(Collection collection)
        {
            var collectionSeason = (collection.Season ?? string.Empty).Trim().ToLower();
            var matchedProducts = await _context.Products
                .AsNoTracking()
                .Where(product =>
                    (product.Season ?? string.Empty).Trim().ToLower() == collectionSeason &&
                    (product.Status ?? string.Empty).ToLower() != "archived")
                .ToListAsync();

            var existingPendingOrders = await _context.ProductionOrders
                .Where(order =>
                    order.CollectionName == collection.CollectionName &&
                    (order.Status == "Pending" || order.Status == "For Scheduling" || order.Status == "Schedule Ready"))
                .ToListAsync();
            if (existingPendingOrders.Count > 0)
            {
                var pendingOrderIds = existingPendingOrders.Select(order => order.OrderID).ToList();
                var existingVersions = await _context.ProductionVersions
                    .Where(version => pendingOrderIds.Contains(version.OrderID))
                    .ToListAsync();
                if (existingVersions.Count > 0)
                {
                    _context.ProductionVersions.RemoveRange(existingVersions);
                }
                _context.ProductionOrders.RemoveRange(existingPendingOrders);
            }

            var dueDate = DateOnly.FromDateTime(collection.TargetLaunchDate);
            var now = DateTime.UtcNow;
            var createdOrders = new List<(ProductionOrder Order, Product Product)>();
            var matchedProductIds = matchedProducts.Select(product => product.ProductID).Distinct().ToList();
            var existingVersionRows = await _context.ProductionVersions
                .AsNoTracking()
                .Where(version => matchedProductIds.Contains(version.ProductID))
                .ToListAsync();
            var latestVersionByProduct = existingVersionRows
                .GroupBy(version => version.ProductID)
                .ToDictionary(group => group.Key, group => group
                    .Select(version => ParseVersionNumber(version.VersionNumber))
                    .DefaultIfEmpty(0)
                    .Max());
            foreach (var product in matchedProducts)
            {
                var payload = new
                {
                    CollectionID = collection.CollectionID,
                    CollectionCode = collection.CollectionCode,
                    ProductID = product.ProductID,
                    ProductSKU = product.SKU,
                    ProductName = product.Name,
                    PlannedQty = Math.Max(1, product.Quantity)
                };

                var order = new ProductionOrder
                {
                    CollectionName = collection.CollectionName,
                    VersionNumber = null,
                    Products = JsonSerializer.Serialize(payload),
                    Status = "Pending",
                    DueDate = dueDate,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                createdOrders.Add((order, product));
                _context.ProductionOrders.Add(order);
            }

            // Save first to generate OrderID values.
            await _context.SaveChangesAsync();

            var createdVersions = new List<ProductionVersion>();
            foreach (var item in createdOrders)
            {
                var nextVersion = (latestVersionByProduct.TryGetValue(item.Product.ProductID, out var currentVersion)
                    ? currentVersion
                    : 0) + 1;
                latestVersionByProduct[item.Product.ProductID] = nextVersion;

                var version = new ProductionVersion
                {
                    VersionNumber = $"Version {nextVersion}",
                    ProductID = item.Product.ProductID,
                    OrderID = item.Order.OrderID,
                    CollectionID = collection.CollectionID,
                    CollectionCode = collection.CollectionCode,
                    CollectionName = collection.CollectionName,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                createdVersions.Add(version);
                _context.ProductionVersions.Add(version);
            }

            await _context.SaveChangesAsync();

            for (var i = 0; i < createdOrders.Count && i < createdVersions.Count; i++)
            {
                createdOrders[i].Order.VersionNumber = createdVersions[i].VersionNumber;
                createdOrders[i].Order.UpdatedAt = DateTime.UtcNow;
            }

            return matchedProducts.Count;
        }

        private static int ParseVersionNumber(string? versionNumber)
        {
            var raw = (versionNumber ?? string.Empty).Trim();
            if (raw.StartsWith("Version ", StringComparison.OrdinalIgnoreCase))
            {
                var suffix = raw["Version ".Length..].Trim();
                if (int.TryParse(suffix, out var parsed) && parsed > 0)
                {
                    return parsed;
                }
            }

            return 0;
        }

        private static string MapAdminQueueStatus(string collectionStatus, string? adminDecision)
        {
            var source = (adminDecision ?? collectionStatus ?? string.Empty).Trim().ToLowerInvariant();
            if (source.Contains("approved") || source.Contains("released to production")) return "Approved";
            if (source.Contains("revision")) return "Revised";
            if (source.Contains("rejected")) return "Rejected";
            return "Submitted";
        }
    }
}
