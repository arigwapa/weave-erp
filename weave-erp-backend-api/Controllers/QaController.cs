using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/qa")]
    public class QaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<QaBatchQueueItemDto>>> GetPending()
        {
            var rows = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(x =>
                    (x.QAStatus ?? "").ToLower() == "pending" ||
                    ((x.QAStatus ?? "") == "" && (x.Status == "Submitted" || x.Status == "Pending")))
                .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
                .Select(x => new QaBatchQueueItemDto
                {
                    BatchBoardID = x.BatchBoardID,
                    BatchNumber = x.Code,
                    VersionNumber = x.VersionNumber,
                    ProductName = string.IsNullOrWhiteSpace(x.Product) ? x.ProductSKU : x.Product,
                    CollectionName = x.CollectionName,
                    QuantityProduced = x.Qty,
                    DateSubmitted = (x.UpdatedAt ?? x.CreatedAt).ToString("yyyy-MM-dd HH:mm"),
                    Status = "Pending"
                })
                .ToListAsync();

            return Ok(rows);
        }

        [HttpGet("ongoing")]
        public async Task<ActionResult<IEnumerable<QaBatchQueueItemDto>>> GetOngoing()
        {
            var userLookup = await _context.Users
                .AsNoTracking()
                .ToDictionaryAsync(x => x.UserID, x => x.Fullname);

            var rows = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(x => (x.QAStatus ?? "").ToLower() == "for inspection")
                .OrderByDescending(x => x.QAStartedAt ?? x.UpdatedAt ?? x.CreatedAt)
                .ToListAsync();

            var result = rows.Select(x => new QaBatchQueueItemDto
            {
                BatchBoardID = x.BatchBoardID,
                BatchNumber = x.Code,
                VersionNumber = x.VersionNumber,
                ProductName = string.IsNullOrWhiteSpace(x.Product) ? x.ProductSKU : x.Product,
                CollectionName = x.CollectionName,
                QuantityProduced = x.Qty,
                DateSubmitted = x.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                Status = "For Inspection",
                Inspector = x.QAStartedByUserID.HasValue && userLookup.TryGetValue(x.QAStartedByUserID.Value, out var name)
                    ? name
                    : string.Empty,
                StartedAt = (x.QAStartedAt ?? x.UpdatedAt ?? x.CreatedAt).ToString("yyyy-MM-dd HH:mm")
            }).ToList();

            return Ok(result);
        }

        [HttpGet("completed")]
        public async Task<ActionResult<IEnumerable<QaBatchQueueItemDto>>> GetCompleted()
        {
            var rows = await _context.Inspections
                .AsNoTracking()
                .OrderByDescending(x => x.InspectionDate)
                .ThenByDescending(x => x.InspectionID)
                .ToListAsync();

            if (rows.Count == 0)
            {
                return Ok(Array.Empty<QaBatchQueueItemDto>());
            }

            var batchIds = rows.Select(x => x.BatchBoardID).Distinct().ToList();
            var userIds = rows.Select(x => x.UserID).Distinct().ToList();

            var batchLookup = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(x => batchIds.Contains(x.BatchBoardID))
                .ToDictionaryAsync(x => x.BatchBoardID);
            var userLookup = await _context.Users
                .AsNoTracking()
                .Where(x => userIds.Contains(x.UserID))
                .ToDictionaryAsync(x => x.UserID);

            var result = rows.Select(inspection =>
            {
                batchLookup.TryGetValue(inspection.BatchBoardID, out var batch);
                userLookup.TryGetValue(inspection.UserID, out var user);
                return new QaBatchQueueItemDto
                {
                    BatchBoardID = inspection.BatchBoardID,
                    BatchNumber = batch?.Code ?? string.Empty,
                    VersionNumber = batch?.VersionNumber ?? string.Empty,
                    ProductName = batch == null ? string.Empty : (string.IsNullOrWhiteSpace(batch.Product) ? batch.ProductSKU : batch.Product),
                    CollectionName = batch?.CollectionName ?? string.Empty,
                    QuantityProduced = batch?.Qty ?? 0,
                    DateSubmitted = (batch?.CreatedAt ?? inspection.CreatedAt).ToString("yyyy-MM-dd HH:mm"),
                    Status = "Inspection Finished",
                    Inspector = user?.Fullname ?? $"User #{inspection.UserID}",
                    StartedAt = (batch?.QAStartedAt ?? batch?.UpdatedAt ?? batch?.CreatedAt ?? inspection.CreatedAt).ToString("yyyy-MM-dd HH:mm"),
                    InspectionDate = inspection.InspectionDate.ToString("yyyy-MM-dd HH:mm"),
                    SampleSize = inspection.SampleSize,
                    DefectsFound = inspection.DefectsFound,
                    Result = ToUiResult(inspection.Result)
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPost("start-inspection/{batchId:int}")]
        public async Task<ActionResult<QaBatchQueueItemDto>> StartInspection(int batchId)
        {
            var batch = await _context.ProductionBatchBoardItems.FirstOrDefaultAsync(x => x.BatchBoardID == batchId);
            if (batch == null)
            {
                return NotFound("Batch not found.");
            }

            var currentQaStatus = (batch.QAStatus ?? "").Trim();
            if (currentQaStatus.Equals("Inspection Finished", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Batch is already completed.");
            }

            var userId = TryGetCurrentUserId();
            batch.QAStatus = "For Inspection";
            batch.QAStartedByUserID = userId;
            batch.QAStartedAt = DateTime.UtcNow;
            batch.Status = "For Inspection";
            batch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new QaBatchQueueItemDto
            {
                BatchBoardID = batch.BatchBoardID,
                BatchNumber = batch.Code,
                VersionNumber = batch.VersionNumber,
                ProductName = string.IsNullOrWhiteSpace(batch.Product) ? batch.ProductSKU : batch.Product,
                CollectionName = batch.CollectionName,
                QuantityProduced = batch.Qty,
                DateSubmitted = batch.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                Status = "For Inspection",
                StartedAt = (batch.QAStartedAt ?? batch.UpdatedAt ?? batch.CreatedAt).ToString("yyyy-MM-dd HH:mm")
            });
        }

        private int? TryGetCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var parsed) ? parsed : null;
        }

        private static string ToUiResult(string dbResult)
        {
            var value = (dbResult ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "pass" => "Accepted",
                "fail" => "Rejected",
                "hold" => "Review Required",
                _ => "Review Required"
            };
        }
    }
}
