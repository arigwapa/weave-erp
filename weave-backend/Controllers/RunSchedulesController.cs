using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/production/run-schedules")]
    public class RunSchedulesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RunSchedulesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RunScheduleRecordDto>>> List()
        {
            var rows = await _context.RunSchedules
                .AsNoTracking()
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt)
                .ThenByDescending(item => item.RunScheduleID)
                .ToListAsync();
            return Ok(rows.Select(ToDto).ToList());
        }

        [HttpPut]
        public async Task<ActionResult<IEnumerable<RunScheduleRecordDto>>> SaveAll([FromBody] SaveRunSchedulesRequest request)
        {
            if (request?.Items == null)
            {
                return BadRequest("Payload must include an items array.");
            }

            var normalized = request.Items
                .Select(NormalizeRecord)
                .Where(item => item != null)
                .Select(item => item!)
                .GroupBy(item => item.Key)
                .Select(group => group.Last())
                .ToList();

            var now = DateTime.UtcNow;
            var existing = await _context.RunSchedules.ToDictionaryAsync(item => item.ScheduleKey, StringComparer.OrdinalIgnoreCase);
            var incomingKeys = normalized.Select(item => item.Key).ToHashSet(StringComparer.OrdinalIgnoreCase);

            foreach (var row in _context.RunSchedules.Where(item => !incomingKeys.Contains(item.ScheduleKey)))
            {
                _context.RunSchedules.Remove(row);
            }

            foreach (var dto in normalized)
            {
                if (!existing.TryGetValue(dto.Key, out var entity))
                {
                    entity = new RunSchedule
                    {
                        ScheduleKey = dto.Key,
                        CreatedAt = now
                    };
                    _context.RunSchedules.Add(entity);
                }

                entity.CollectionID = dto.CollectionID;
                entity.ProductID = dto.ProductID;
                entity.RunCode = dto.RunCode;
                entity.LineTeam = dto.LineTeam;
                entity.OwnerAssignment = dto.OwnerAssignment;
                entity.StartDate = dto.StartDate;
                entity.EndDate = dto.EndDate;
                entity.PlannedQty = dto.PlannedQty;
                entity.Status = dto.Status;
                entity.Source = dto.Source;
                entity.CollectionCode = dto.CollectionCode;
                entity.CollectionName = dto.CollectionName;
                entity.ProductSKU = dto.ProductSKU;
                entity.ProductName = dto.ProductName;
                entity.LinkedVersion = dto.LinkedVersion;
                entity.SizePlanJson = string.IsNullOrWhiteSpace(dto.SizePlanJson) ? "{}" : dto.SizePlanJson.Trim();
                entity.UpdatedAt = now;
            }

            // Keep ProductionOrder status in sync with production workflow.
            var orders = await _context.ProductionOrders.ToListAsync();
            var ordersByKey = orders
                .Select(order => new { Order = order, Payload = ParseOrderProduct(order.Products) })
                .Where(x => x.Payload != null && x.Payload.CollectionID > 0 && x.Payload.ProductID > 0)
                .GroupBy(
                    x => $"{x.Payload!.CollectionID}-{x.Payload.ProductID}",
                    StringComparer.OrdinalIgnoreCase)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(x => x.Order).ToList(),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var dto in normalized)
            {
                var key = $"{dto.CollectionID}-{dto.ProductID}";
                if (!ordersByKey.TryGetValue(key, out var matchingOrders))
                {
                    continue;
                }

                foreach (var order in matchingOrders)
                {
                    order.Status = MapScheduleStatusToOrderStatus(dto.Status);
                    order.UpdatedAt = now;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(normalized);
        }

        private static RunScheduleRecordDto? NormalizeRecord(RunScheduleRecordDto? input)
        {
            if (input == null) return null;

            var collectionId = Math.Max(0, input.CollectionID);
            var productId = Math.Max(0, input.ProductID);
            var runCode = (input.RunCode ?? string.Empty).Trim();
            if (collectionId <= 0 || productId <= 0 || string.IsNullOrWhiteSpace(runCode))
            {
                return null;
            }

            return new RunScheduleRecordDto
            {
                Key = string.IsNullOrWhiteSpace(input.Key) ? $"{collectionId}-{productId}" : input.Key.Trim(),
                CollectionID = collectionId,
                ProductID = productId,
                RunCode = runCode,
                LineTeam = (input.LineTeam ?? string.Empty).Trim(),
                OwnerAssignment = (input.OwnerAssignment ?? string.Empty).Trim(),
                StartDate = (input.StartDate ?? string.Empty).Trim(),
                EndDate = (input.EndDate ?? string.Empty).Trim(),
                PlannedQty = Math.Max(1, input.PlannedQty),
                Status = NormalizeStatus(input.Status),
                Source = string.Equals(input.Source, "Scheduler", StringComparison.OrdinalIgnoreCase) ? "Scheduler" : "Queue",
                CollectionCode = (input.CollectionCode ?? string.Empty).Trim(),
                CollectionName = (input.CollectionName ?? string.Empty).Trim(),
                ProductSKU = (input.ProductSKU ?? string.Empty).Trim(),
                ProductName = (input.ProductName ?? string.Empty).Trim(),
                LinkedVersion = string.IsNullOrWhiteSpace(input.LinkedVersion) ? null : input.LinkedVersion.Trim(),
                SizePlanJson = string.IsNullOrWhiteSpace(input.SizePlanJson) ? "{}" : input.SizePlanJson.Trim()
            };
        }

        private static string NormalizeStatus(string? status)
        {
            var value = (status ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "for scheduling" => "For Scheduling",
                "schedule ready" => "Schedule Ready",
                "ready" => "Schedule Ready",
                "schedule set" => "Schedule Ready",
                "run candidate" => "Run Candidate",
                "candidate" => "Run Candidate",
                "schedule running" => "Run Candidate",
                "unpacked" => "Unpacked",
                "batch ready" => "Batch Ready",
                "finished run" => "Finished Run",
                _ => "For Scheduling"
            };
        }

        private static string MapScheduleStatusToOrderStatus(string? scheduleStatus)
        {
            var value = NormalizeStatus(scheduleStatus);
            return value switch
            {
                "For Scheduling" => "For Scheduling",
                "Schedule Ready" => "Schedule Ready",
                "Run Candidate" => "Run Candidate",
                "Schedule Running" => "Run Candidate",
                "Unpacked" => "Unpacked",
                "Batch Ready" => "Batch Ready",
                "Finished Run" => "Finished Run",
                _ => "Pending"
            };
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

        private static RunScheduleRecordDto ToDto(RunSchedule row)
        {
            return new RunScheduleRecordDto
            {
                Key = row.ScheduleKey,
                CollectionID = row.CollectionID,
                ProductID = row.ProductID,
                RunCode = row.RunCode,
                LineTeam = row.LineTeam,
                OwnerAssignment = row.OwnerAssignment,
                StartDate = row.StartDate,
                EndDate = row.EndDate,
                PlannedQty = row.PlannedQty,
                Status = NormalizeStatus(row.Status),
                Source = string.Equals(row.Source, "Scheduler", StringComparison.OrdinalIgnoreCase) ? "Scheduler" : "Queue",
                CollectionCode = row.CollectionCode,
                CollectionName = row.CollectionName,
                ProductSKU = row.ProductSKU,
                ProductName = row.ProductName,
                LinkedVersion = row.LinkedVersion,
                SizePlanJson = string.IsNullOrWhiteSpace(row.SizePlanJson) ? "{}" : row.SizePlanJson
            };
        }

        private sealed class OrderProductPayload
        {
            public int CollectionID { get; set; }
            public int ProductID { get; set; }
        }
    }
}
