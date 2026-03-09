using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/finance/budget-planner")]
    public class FinanceBudgetPlannerController : ControllerBase
    {
        private const decimal SqlDecimalMax = 99_999_999_999_999.99m;
        private readonly AppDbContext _context;

        public FinanceBudgetPlannerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("collections")]
        public async Task<ActionResult<IEnumerable<FinanceBudgetPlannerCollectionDto>>> GetCollections()
        {
            var approvedCollections = await _context.Collections
                .AsNoTracking()
                .Where(c => c.Status.ToLower() != "archived")
                .OrderByDescending(c => c.CollectionID)
                .ToListAsync();

            if (approvedCollections.Count == 0)
            {
                return Ok(Array.Empty<FinanceBudgetPlannerCollectionDto>());
            }

            var seasons = approvedCollections
                .Select(c => (c.Season ?? string.Empty).Trim().ToLowerInvariant())
                .Distinct()
                .ToList();

            var products = await _context.Products
                .AsNoTracking()
                .Where(p => seasons.Contains((p.Season ?? string.Empty).Trim().ToLower()) && (p.Status ?? string.Empty) != "Archived")
                .ToListAsync();

            var productIds = products.Select(p => p.ProductID).ToList();
            var bomLines = await _context.BillOfMaterials
                .AsNoTracking()
                .Where(line => productIds.Contains(line.ProductID))
                .ToListAsync();

            var planMap = await _context.CollectionBudgetPlans
                .AsNoTracking()
                .Where(plan => approvedCollections.Select(c => c.CollectionID).Contains(plan.CollectionID))
                .ToDictionaryAsync(plan => plan.CollectionID);
            var budgetMap = await _context.Budgets
                .AsNoTracking()
                .Where(budget => budget.CollectionID.HasValue && approvedCollections.Select(c => c.CollectionID).Contains(budget.CollectionID.Value))
                .GroupBy(budget => budget.CollectionID!.Value)
                .ToDictionaryAsync(group => group.Key, group => group.OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt).First());

            var bomByProduct = bomLines
                .GroupBy(line => line.ProductID)
                .ToDictionary(group => group.Key, group => group.ToList());

            var result = approvedCollections.Select(collection =>
            {
                var collectionProductEntities = products
                    .Where(product =>
                        string.Equals(product.Season?.Trim(), collection.Season?.Trim(), StringComparison.OrdinalIgnoreCase))
                    .ToList();

                var isBomCompleted = collectionProductEntities.Count > 0
                    && collectionProductEntities.All(product =>
                        bomByProduct.TryGetValue(product.ProductID, out var lines) && lines.Count > 0);

                if (!isBomCompleted)
                {
                    return null;
                }

                var collectionProducts = collectionProductEntities
                    .Select(product =>
                    {
                        var lines = bomByProduct.TryGetValue(product.ProductID, out var found)
                            ? found
                            : new List<BillOfMaterials>();
                        return new FinanceBudgetPlannerProductDto
                        {
                            ProductID = product.ProductID,
                            SKU = product.SKU,
                            Name = product.Name,
                            TotalQty = lines.Sum(line => line.QtyRequired),
                            TotalCost = lines.Sum(line => line.QtyRequired * line.UnitCost) * Math.Max(1, product.Quantity)
                        };
                    })
                    .ToList();

                var totalBomCost = collectionProducts.Sum(product => product.TotalCost);
                var plan = planMap.TryGetValue(collection.CollectionID, out var foundPlan) ? foundPlan : null;
                var budget = budgetMap.TryGetValue(collection.CollectionID, out var foundBudget) ? foundBudget : null;
                var contingency = plan?.ContingencyPercent ?? 0m;
                var budgetCap = plan?.BudgetCap ?? totalBomCost;
                var wasteAllowanceBudget = budget?.WasteAllowanceBudget ?? 0m;
                var forecast = (totalBomCost * (1 + (contingency / 100m))) + wasteAllowanceBudget;
                var reservedAmount = budget?.ReservedAmount ?? 0m;
                var spentAmount = budget?.SpentAmount ?? 0m;
                var remainingAmount = budget?.RemainingAmount ?? Math.Max(0m, budgetCap + wasteAllowanceBudget - reservedAmount - spentAmount);
                var readiness = plan == null
                    ? "Pending"
                    : forecast > budgetCap
                        ? "Review"
                        : "Complete";

                var riskFlags = new List<string>();
                if (forecast > budgetCap)
                {
                    var overPercent = budgetCap <= 0 ? 100m : ((forecast - budgetCap) / budgetCap) * 100m;
                    riskFlags.Add($"Budget shortfall risk (+{overPercent:F1}%)");
                }
                if (collectionProducts.Count == 0)
                {
                    riskFlags.Add("No product/BOM lines found for this collection.");
                }
                if (riskFlags.Count == 0)
                {
                    riskFlags.Add("No major risk. Within variance threshold.");
                }

                return new FinanceBudgetPlannerCollectionDto
                {
                    CollectionID = collection.CollectionID,
                    CollectionCode = collection.CollectionCode,
                    CollectionName = collection.CollectionName,
                    CollectionStatus = collection.Status,
                    PlannerStatus = MapPlannerStatus(collection.Status, plan?.AdminDecision, plan != null),
                    IsAdminApproved = IsAdminApproved(collection.Status, plan?.AdminDecision),
                    AdminDecision = plan?.AdminDecision ?? string.Empty,
                    AdminDecisionReason = plan?.AdminDecisionReason ?? string.Empty,
                    TotalBomCost = totalBomCost,
                    BudgetCap = budgetCap,
                    WasteAllowanceBudget = wasteAllowanceBudget,
                    Contingency = contingency,
                    Forecast = forecast,
                    ReservedAmount = reservedAmount,
                    SpentAmount = spentAmount,
                    RemainingAmount = remainingAmount,
                    Readiness = readiness,
                    HasSavedPlan = plan != null,
                    RiskFlags = riskFlags,
                    Products = collectionProducts
                };
            })
            .Where(item => item != null)
            .Select(item => item!)
            .ToList();

            return Ok(result);
        }

        [HttpPut("collections/{collectionId:int}/plan")]
        public async Task<ActionResult<FinanceBudgetPlannerCollectionDto>> SavePlan(
            int collectionId,
            [FromBody] SaveFinanceBudgetPlannerPlanRequest request)
        {
            if (!TryValidateDto(request))
            {
                return ValidationProblem(ModelState);
            }
            if (request.BudgetCap > SqlDecimalMax)
            {
                ModelState.AddModelError(nameof(request.BudgetCap), "Collection budget cap exceeds database limit (99,999,999,999,999.99).");
                return ValidationProblem(ModelState);
            }
            if (request.WasteAllowanceBudget > SqlDecimalMax)
            {
                ModelState.AddModelError(nameof(request.WasteAllowanceBudget), "Waste allowance budget exceeds database limit (99,999,999,999,999.99).");
                return ValidationProblem(ModelState);
            }

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.CollectionID == collectionId);
            if (collection == null)
            {
                return NotFound();
            }

            if (collection.Status.Equals("Archived", StringComparison.OrdinalIgnoreCase))
            {
                ModelState.AddModelError(nameof(collection.Status), "Archived collections cannot be edited.");
                return ValidationProblem(ModelState);
            }

            var plan = await _context.CollectionBudgetPlans.FirstOrDefaultAsync(p => p.CollectionID == collectionId);
            var actorUserId = GetActorUserId() ?? 1;
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

            plan.BudgetCap = request.BudgetCap;
            plan.ContingencyPercent = request.Contingency;
            plan.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
            plan.UpdatedByUserID = actorUserId;
            plan.UpdatedAt = DateTime.UtcNow;

            // Once a budget plan is configured, queue it for admin approval
            // unless it is already in an admin-controlled terminal state.
            if (!IsAdminApproved(collection.Status, plan.AdminDecision)
                && !collection.Status.Contains("submitted to admin", StringComparison.OrdinalIgnoreCase)
                && !collection.Status.Contains("returned to product manager", StringComparison.OrdinalIgnoreCase))
            {
                collection.Status = "For Admin Approval";
                collection.UpdatedByUserID = actorUserId;
                collection.UpdatedAt = DateTime.UtcNow;
            }

            var budget = await _context.Budgets
                .FirstOrDefaultAsync(item => item.CollectionID == collectionId);
            if (budget == null)
            {
                budget = new Budget
                {
                    BudgetCode = BuildBudgetCode(collection),
                    CollectionID = collectionId,
                    AppliesToAll = false,
                    PeriodStart = DateOnly.FromDateTime(collection.TargetLaunchDate),
                    PeriodEnd = DateOnly.FromDateTime(collection.TargetLaunchDate),
                    MaterialsBudget = request.BudgetCap,
                    WasteAllowanceBudget = request.WasteAllowanceBudget,
                    TotalBudget = request.BudgetCap + request.WasteAllowanceBudget,
                    ReservedAmount = 0m,
                    SpentAmount = 0m,
                    RemainingAmount = request.BudgetCap + request.WasteAllowanceBudget,
                    Status = "Draft",
                    Notes = string.IsNullOrWhiteSpace(request.Notes) ? "Budget plan from PLM Budget Planner." : request.Notes.Trim(),
                    CreatedByUserID = actorUserId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedByUserID = actorUserId,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Budgets.Add(budget);
            }
            else
            {
                budget.CollectionID = collectionId;
                budget.BudgetCode = string.IsNullOrWhiteSpace(budget.BudgetCode) ? BuildBudgetCode(collection) : budget.BudgetCode;
                budget.PeriodStart = DateOnly.FromDateTime(collection.TargetLaunchDate);
                budget.PeriodEnd = DateOnly.FromDateTime(collection.TargetLaunchDate);
                budget.MaterialsBudget = request.BudgetCap;
                budget.WasteAllowanceBudget = request.WasteAllowanceBudget;
                budget.TotalBudget = request.BudgetCap + request.WasteAllowanceBudget;
                budget.RemainingAmount = Math.Max(0m, budget.TotalBudget - budget.ReservedAmount - budget.SpentAmount);
                budget.Notes = string.IsNullOrWhiteSpace(request.Notes) ? (string.IsNullOrWhiteSpace(budget.Notes) ? "Budget plan from PLM Budget Planner." : budget.Notes) : request.Notes.Trim();
                budget.UpdatedByUserID = actorUserId;
                budget.UpdatedAt = DateTime.UtcNow;
            }
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && (sqlEx.Message.Contains("out of range", StringComparison.OrdinalIgnoreCase)))
            {
                ModelState.AddModelError(string.Empty, "One or more budget values exceed the database limit (99,999,999,999,999.99).");
                return ValidationProblem(ModelState);
            }

            // Return latest computed row from queue for a single source of truth.
            var rows = await GetCollections();
            if (rows.Result is OkObjectResult ok && ok.Value is IEnumerable<FinanceBudgetPlannerCollectionDto> list)
            {
                var updated = list.FirstOrDefault(item => item.CollectionID == collectionId);
                if (updated != null)
                {
                    return Ok(updated);
                }
            }

            return Ok(new FinanceBudgetPlannerCollectionDto
            {
                CollectionID = collection.CollectionID,
                CollectionCode = collection.CollectionCode,
                CollectionName = collection.CollectionName,
                BudgetCap = plan.BudgetCap,
                WasteAllowanceBudget = request.WasteAllowanceBudget,
                Contingency = plan.ContingencyPercent
            });
        }

        private static string BuildBudgetCode(Collection collection)
        {
            var code = (collection.CollectionCode ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(code))
            {
                return $"BGT-{collection.CollectionID}";
            }
            return $"BGT-{code}-{collection.CollectionID}";
        }

        private static bool IsAdminApproved(string? collectionStatus, string? adminDecision)
        {
            var source = $"{collectionStatus} {adminDecision}".ToLowerInvariant();
            return source.Contains("approved") || source.Contains("released to production");
        }

        private static string MapPlannerStatus(string? collectionStatus, string? adminDecision, bool hasSavedPlan)
        {
            var source = $"{collectionStatus} {adminDecision}".ToLowerInvariant();
            if (source.Contains("approved") || source.Contains("released to production"))
            {
                return "Admin Approved";
            }
            if (source.Contains("returned to product manager") || source.Contains("revision") || source.Contains("reject"))
            {
                return "For Revision";
            }
            if (hasSavedPlan || source.Contains("submitted to admin") || source.Contains("for admin approval"))
            {
                return "For Admin Approval";
            }
            return "Planning Budget";
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
