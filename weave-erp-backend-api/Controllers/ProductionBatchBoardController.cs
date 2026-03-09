using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/production/batches")]
    public class ProductionBatchBoardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductionBatchBoardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductionBatchBoardItemDto>>> List()
        {
            var rows = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt)
                .ThenByDescending(item => item.BatchBoardID)
                .ToListAsync();
            return Ok(rows.Select(ToDto).ToList());
        }

        [HttpGet("candidates")]
        public async Task<ActionResult<IEnumerable<ProductionBatchCandidateDto>>> ListCandidates()
        {
            var runningSchedules = await _context.RunSchedules
                .AsNoTracking()
                .Where(x => x.Status == "Schedule Running" || x.Status == "Finished Run")
                .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
                .ToListAsync();

            if (runningSchedules.Count == 0)
            {
                return Ok(Array.Empty<ProductionBatchCandidateDto>());
            }

            var orders = await _context.ProductionOrders
                .AsNoTracking()
                .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
                .ToListAsync();

            var orderByCollectionProduct = orders
                .Select(order => new
                {
                    Order = order,
                    Product = ParseOrderProduct(order.Products)
                })
                .Where(x => x.Product != null && x.Product.CollectionID > 0 && x.Product.ProductID > 0)
                .GroupBy(x => $"{x.Product!.CollectionID}:{x.Product!.ProductID}", StringComparer.OrdinalIgnoreCase)
                .ToDictionary(group => group.Key, group => group.First().Order, StringComparer.OrdinalIgnoreCase);

            var candidates = runningSchedules
                .Select(schedule =>
                {
                    orderByCollectionProduct.TryGetValue($"{schedule.CollectionID}:{schedule.ProductID}", out var order);
                    return new ProductionBatchCandidateDto
                    {
                        OrderID = order?.OrderID ?? 0,
                        VersionNumber = order?.VersionNumber ?? schedule.LinkedVersion ?? string.Empty,
                        ProductID = schedule.ProductID,
                        CollectionID = schedule.CollectionID,
                        CollectionCode = schedule.CollectionCode ?? string.Empty,
                        CollectionName = schedule.CollectionName ?? string.Empty,
                        ProductSKU = schedule.ProductSKU ?? string.Empty,
                        ProductName = schedule.ProductName ?? string.Empty,
                        RunCode = schedule.RunCode ?? string.Empty,
                        ScheduleKey = schedule.ScheduleKey ?? string.Empty,
                        SourceStatus = NormalizeSourceStatus(schedule.Status),
                        PlannedQty = Math.Max(1, schedule.PlannedQty),
                        SizePlan = ParseSizePlan(schedule.SizePlanJson)
                    };
                })
                .GroupBy(x => x.ScheduleKey, StringComparer.OrdinalIgnoreCase)
                .Select(group => group.First())
                .OrderBy(x => x.CollectionCode)
                .ThenBy(x => x.ProductSKU)
                .ToList();

            return Ok(candidates);
        }

        [HttpPut]
        public async Task<ActionResult<IEnumerable<ProductionBatchBoardItemDto>>> Save([FromBody] SaveProductionBatchBoardRequest request)
        {
            if (request?.Items == null)
            {
                return BadRequest("Payload must include an items array.");
            }

            var items = request.Items
                .Select(NormalizeItem)
                .Where(item => item != null)
                .Select(item => item!)
                .GroupBy(item => item.Code, StringComparer.OrdinalIgnoreCase)
                .Select(group => group.Last())
                .ToList();

            var now = DateTime.UtcNow;
            var existingRows = await _context.ProductionBatchBoardItems.ToListAsync();
            var existing = existingRows
                .GroupBy(item => NormalizeCode(item.Code), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);
            var incomingCodes = items.Select(item => NormalizeCode(item.Code)).ToHashSet(StringComparer.OrdinalIgnoreCase);

            var incomingScheduleKeys = items
                .Select(item => (item.ScheduleKey ?? string.Empty).Trim())
                .Where(key => !string.IsNullOrWhiteSpace(key))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            var schedulesByKey = await _context.RunSchedules
                .AsNoTracking()
                .Where(schedule => incomingScheduleKeys.Contains(schedule.ScheduleKey))
                .ToDictionaryAsync(schedule => schedule.ScheduleKey, StringComparer.OrdinalIgnoreCase);

            var invalidCreateReasons = new List<string>();
            foreach (var dto in items)
            {
                var normalizedCode = NormalizeCode(dto.Code);
                var isCreate = !existing.ContainsKey(normalizedCode);
                if (!isCreate)
                {
                    continue;
                }

                var scheduleKey = (dto.ScheduleKey ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(scheduleKey))
                {
                    invalidCreateReasons.Add($"Batch '{normalizedCode}' is missing ScheduleKey.");
                    continue;
                }

                if (!schedulesByKey.TryGetValue(scheduleKey, out var linkedSchedule))
                {
                    invalidCreateReasons.Add($"Batch '{normalizedCode}' links to unknown ScheduleKey '{scheduleKey}'.");
                    continue;
                }

                if (!IsScheduleRunning(linkedSchedule.Status))
                {
                    invalidCreateReasons.Add(
                        $"Batch '{normalizedCode}' cannot be created because run '{scheduleKey}' is '{NormalizeSourceStatus(linkedSchedule.Status)}' (must be 'Schedule Running')."
                    );
                }
            }

            if (invalidCreateReasons.Count > 0)
            {
                return BadRequest(new
                {
                    message = "Batch creation requires linked run status 'Schedule Running'.",
                    errors = invalidCreateReasons
                });
            }

            foreach (var row in existingRows.Where(item => !incomingCodes.Contains(NormalizeCode(item.Code))))
            {
                _context.ProductionBatchBoardItems.Remove(row);
            }

            foreach (var dto in items)
            {
                var normalizedCode = NormalizeCode(dto.Code);
                if (!existing.TryGetValue(normalizedCode, out var entity))
                {
                    entity = new ProductionBatchBoardItem
                    {
                        Code = normalizedCode,
                        CreatedAt = now
                    };
                    _context.ProductionBatchBoardItems.Add(entity);
                }

                entity.Code = normalizedCode;
                entity.OrderID = dto.OrderID;
                entity.VersionNumber = dto.VersionNumber;
                entity.ProductID = dto.ProductID;
                entity.CollectionID = dto.CollectionID;
                entity.CollectionCode = dto.CollectionCode;
                entity.CollectionName = dto.CollectionName;
                entity.ProductSKU = dto.ProductSKU;
                entity.RunCode = dto.RunCode;
                entity.ScheduleKey = dto.ScheduleKey;
                entity.SourceStatus = dto.SourceStatus;
                entity.Product = dto.Product;
                entity.Version = dto.Version;
                entity.Size = dto.Size;
                entity.Qty = dto.Qty;
                entity.Status = dto.Status;
                entity.HandoffNotes = dto.HandoffNotes;
                entity.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();
            return Ok(items);
        }

        private static ProductionBatchBoardItemDto? NormalizeItem(ProductionBatchBoardItemDto? input)
        {
            if (input == null) return null;
            var code = (input.Code ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(code)) return null;

            return new ProductionBatchBoardItemDto
            {
                Code = code,
                OrderID = Math.Max(0, input.OrderID),
                VersionNumber = (input.VersionNumber ?? string.Empty).Trim(),
                ProductID = Math.Max(0, input.ProductID),
                CollectionID = Math.Max(0, input.CollectionID),
                CollectionCode = (input.CollectionCode ?? string.Empty).Trim(),
                CollectionName = (input.CollectionName ?? string.Empty).Trim(),
                ProductSKU = (input.ProductSKU ?? string.Empty).Trim(),
                RunCode = (input.RunCode ?? string.Empty).Trim(),
                ScheduleKey = (input.ScheduleKey ?? string.Empty).Trim(),
                SourceStatus = NormalizeSourceStatus(input.SourceStatus),
                Product = (input.Product ?? string.Empty).Trim(),
                Version = (input.Version ?? string.Empty).Trim(),
                Size = (input.Size ?? string.Empty).Trim(),
                Qty = Math.Max(1, input.Qty),
                Status = NormalizeStatus(input.Status),
                HandoffNotes = string.IsNullOrWhiteSpace(input.HandoffNotes) ? null : input.HandoffNotes.Trim()
            };
        }

        private static string NormalizeStatus(string? status)
        {
            var value = (status ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "in progress" => "In Progress",
                "completed" => "Completed",
                "sent to qa" => "Submitted",
                "submitted" => "Submitted",
                "approved" => "Approved",
                "disapproved" => "Disapproved",
                "dissaproved" => "Disapproved",
                "blocked" => "Blocked",
                _ => "In Progress"
            };
        }

        private static string NormalizeSourceStatus(string? status)
        {
            var value = (status ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "schedule running" => "Schedule Running",
                "finished run" => "Finished Run",
                _ => string.IsNullOrWhiteSpace(status) ? string.Empty : status.Trim()
            };
        }

        private static string NormalizeCode(string? code)
        {
            return (code ?? string.Empty).Trim();
        }

        private static bool IsScheduleRunning(string? status)
        {
            var value = (status ?? string.Empty).Trim();
            return string.Equals(value, "Schedule Running", StringComparison.OrdinalIgnoreCase);
        }

        private static ProductionBatchBoardItemDto ToDto(ProductionBatchBoardItem row)
        {
            return new ProductionBatchBoardItemDto
            {
                Code = row.Code,
                OrderID = row.OrderID,
                VersionNumber = row.VersionNumber ?? string.Empty,
                ProductID = row.ProductID,
                CollectionID = row.CollectionID,
                CollectionCode = row.CollectionCode ?? string.Empty,
                CollectionName = row.CollectionName ?? string.Empty,
                ProductSKU = row.ProductSKU ?? string.Empty,
                RunCode = row.RunCode ?? string.Empty,
                ScheduleKey = row.ScheduleKey ?? string.Empty,
                SourceStatus = NormalizeSourceStatus(row.SourceStatus),
                Product = row.Product,
                Version = row.Version,
                Size = row.Size,
                Qty = row.Qty,
                Status = NormalizeStatus(row.Status),
                HandoffNotes = row.HandoffNotes
            };
        }

        private static Dictionary<string, int> ParseSizePlan(string? rawSizePlan)
        {
            if (string.IsNullOrWhiteSpace(rawSizePlan))
            {
                return new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            }

            try
            {
                var parsed = JsonSerializer.Deserialize<Dictionary<string, int>>(rawSizePlan);
                return parsed?
                    .Where(x => !string.IsNullOrWhiteSpace(x.Key) && x.Value > 0)
                    .ToDictionary(
                        x => x.Key.Trim(),
                        x => x.Value,
                        StringComparer.OrdinalIgnoreCase
                    ) ?? new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            }
            catch
            {
                return new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            }
        }

        private static OrderProductPayload? ParseOrderProduct(string rawProducts)
        {
            if (string.IsNullOrWhiteSpace(rawProducts))
            {
                return null;
            }

            try
            {
                return JsonSerializer.Deserialize<OrderProductPayload>(rawProducts);
            }
            catch
            {
                return null;
            }
        }

        private sealed class OrderProductPayload
        {
            public int CollectionID { get; set; }
            public int ProductID { get; set; }
        }
    }
}
