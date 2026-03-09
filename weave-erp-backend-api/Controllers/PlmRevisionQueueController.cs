using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/plm/revisions")]
    public class PlmRevisionQueueController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PlmRevisionQueueController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PlmRevisionQueueItemDto>>> GetQueue()
        {
            var collections = await _context.Collections
                .AsNoTracking()
                .Where(c => c.Status.ToLower().Contains("returned to product manager"))
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .ToListAsync();

            if (collections.Count == 0)
            {
                return Ok(Array.Empty<PlmRevisionQueueItemDto>());
            }

            var plans = await _context.CollectionBudgetPlans
                .AsNoTracking()
                .Where(plan => collections.Select(c => c.CollectionID).Contains(plan.CollectionID))
                .ToDictionaryAsync(plan => plan.CollectionID);

            var result = collections.Select(collection =>
            {
                var plan = plans.TryGetValue(collection.CollectionID, out var found) ? found : null;
                var decision = plan?.AdminDecision ?? string.Empty;
                var isRevision = decision.Contains("revision", StringComparison.OrdinalIgnoreCase);
                return new PlmRevisionQueueItemDto
                {
                    CollectionID = collection.CollectionID,
                    CollectionCode = collection.CollectionCode,
                    CollectionName = collection.CollectionName,
                    Season = collection.Season,
                    Status = collection.Status,
                    AdminDecision = decision,
                    AdminDecisionReason = plan?.AdminDecisionReason ?? string.Empty,
                    UpdatedAt = (collection.UpdatedAt ?? collection.CreatedAt).ToString("yyyy-MM-dd HH:mm"),
                    IsRevision = isRevision
                };
            }).ToList();

            return Ok(result);
        }
    }
}
