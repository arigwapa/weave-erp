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
    [Route("api/finance/submission-admin")]
    public class FinanceSubmissionAdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FinanceSubmissionAdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("collections")]
        public async Task<ActionResult<IEnumerable<FinanceSubmissionAdminCollectionDto>>> GetCollections()
        {
            var collections = await _context.Collections
                .AsNoTracking()
                .Where(c =>
                    c.Status.ToLower().Contains("for budget planning") ||
                    c.Status.ToLower().Contains("submitted to admin") ||
                    c.Status.ToLower().Contains("budget approved") ||
                    c.Status.ToLower().Contains("budget rejected"))
                .OrderByDescending(c => c.CollectionID)
                .ToListAsync();

            if (collections.Count == 0)
            {
                return Ok(Array.Empty<FinanceSubmissionAdminCollectionDto>());
            }

            var seasons = collections.Select(c => c.Season.Trim().ToLower()).Distinct().ToList();
            var products = await _context.Products
                .AsNoTracking()
                .Where(p => seasons.Contains(p.Season.Trim().ToLower()) && p.Status != "Archived")
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
                var collectionProducts = products.Where(product =>
                    string.Equals(product.Season?.Trim(), collection.Season?.Trim(), StringComparison.OrdinalIgnoreCase));
                var productCost = collectionProducts.Sum(product =>
                {
                    var lines = bomByProduct.TryGetValue(product.ProductID, out var found)
                        ? found
                        : new List<BillOfMaterials>();
                    return lines.Sum(line => line.QtyRequired * line.UnitCost) * Math.Max(1, product.Quantity);
                });

                var plan = planMap.TryGetValue(collection.CollectionID, out var foundPlan) ? foundPlan : null;
                var status = MapSubmissionStatus(collection.Status);
                return new FinanceSubmissionAdminCollectionDto
                {
                    CollectionID = collection.CollectionID,
                    CollectionCode = collection.CollectionCode,
                    CollectionName = collection.CollectionName,
                    PackageID = $"FP-{DateTime.UtcNow.Year}-{collection.CollectionID:000}",
                    TotalBomCost = productCost,
                    RecommendedBudget = plan?.BudgetCap ?? productCost,
                    Notes = plan?.Notes ?? string.Empty,
                    Status = status,
                    Feedback = BuildFeedbackSummary(status, plan),
                    FeedbackDetail = BuildFeedbackDetail(status, plan),
                    SentToProductManager = plan?.SentToProductManager ?? false,
                    SentToProductionManager = plan?.SentToProductionManager ?? false
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPut("collections/{collectionId:int}/submit")]
        public async Task<ActionResult<FinanceSubmissionAdminCollectionDto>> SubmitToAdmin(
            int collectionId,
            [FromBody] SubmitFinancePackageToAdminRequest request)
        {
            if (!TryValidateDto(request))
            {
                return ValidationProblem(ModelState);
            }

            var collection = await _context.Collections.FirstOrDefaultAsync(c => c.CollectionID == collectionId);
            if (collection == null)
            {
                return NotFound();
            }

            var current = collection.Status.Trim().ToLowerInvariant();
            var canSubmit =
                current.Contains("for budget planning") ||
                current.Contains("budget rejected") ||
                current.Contains("submitted to admin");
            if (!canSubmit)
            {
                ModelState.AddModelError(
                    nameof(collection.Status),
                    "Collection must be in For Budget Planning, Budget Rejected, or Submitted to Admin before submitting.");
                return ValidationProblem(ModelState);
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

            plan.BudgetCap = request.RecommendedBudget;
            plan.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
            plan.UpdatedByUserID = actorUserId;
            plan.UpdatedAt = DateTime.UtcNow;

            collection.Status = "Submitted to Admin";
            collection.UpdatedByUserID = actorUserId;
            collection.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new FinanceSubmissionAdminCollectionDto
            {
                CollectionID = collection.CollectionID,
                CollectionCode = collection.CollectionCode,
                CollectionName = collection.CollectionName,
                PackageID = $"FP-{DateTime.UtcNow.Year}-{collection.CollectionID:000}",
                RecommendedBudget = plan.BudgetCap,
                Notes = plan.Notes ?? string.Empty,
                Status = "Submitted",
                Feedback = "Waiting for admin review",
                FeedbackDetail = "Finance package is submitted and waiting for admin decision.",
                SentToProductManager = false,
                SentToProductionManager = false
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

        private static string MapSubmissionStatus(string collectionStatus)
        {
            var value = (collectionStatus ?? string.Empty).Trim().ToLowerInvariant();
            if (value.Contains("released to production") || value.Contains("budget approved")) return "Approved";
            if (value.Contains("revision")) return "Revision";
            if (value.Contains("budget rejected") || value.Contains("returned to product manager")) return "Rejected";
            if (value.Contains("submitted to admin")) return "Submitted";
            return "Submitted";
        }

        private static string BuildFeedbackSummary(string status, CollectionBudgetPlan? plan)
        {
            if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            {
                return "Approved and released to production manager.";
            }
            if (status.Equals("Rejected", StringComparison.OrdinalIgnoreCase) ||
                status.Equals("Revision", StringComparison.OrdinalIgnoreCase))
            {
                if (plan?.SentToProductManager == true)
                {
                    return "Returned to Product Manager.";
                }
                return "Admin requested revision.";
            }
            return "Waiting for admin review";
        }

        private static string BuildFeedbackDetail(string status, CollectionBudgetPlan? plan)
        {
            var reason = string.IsNullOrWhiteSpace(plan?.AdminDecisionReason) ? "No reason provided." : plan!.AdminDecisionReason!;
            if (status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            {
                return $"Decision: {plan?.AdminDecision ?? "Approved"}. {reason} Sent to production manager: {(plan?.SentToProductionManager == true ? "Yes" : "No")}.";
            }
            if (status.Equals("Rejected", StringComparison.OrdinalIgnoreCase) ||
                status.Equals("Revision", StringComparison.OrdinalIgnoreCase))
            {
                return $"Decision: {plan?.AdminDecision ?? status}. {reason} Sent to product manager: {(plan?.SentToProductManager == true ? "Yes" : "No")}.";
            }
            return "Finance package is submitted and waiting for admin decision.";
        }
    }
}
