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
    [Route("api/productionorder")]
    public class ProductionOrdersController : GenericCrudController<ProductionOrder>
    {
        private readonly AppDbContext _context;

        public ProductionOrdersController(AppDbContext context) : base(context, "OrderID")
        {
            _context = context;
        }

        [HttpGet("queue")]
        public async Task<ActionResult<IEnumerable<ProductionQueueItemDto>>> GetQueue()
        {
            var orders = await _context.ProductionOrders
                .AsNoTracking()
                .OrderByDescending(order => order.UpdatedAt ?? order.CreatedAt)
                .ToListAsync();

            if (orders.Count == 0)
            {
                return Ok(Array.Empty<ProductionQueueItemDto>());
            }

            var parsedRows = orders
                .Select(order => new
                {
                    Order = order,
                    Product = ParseOrderProduct(order.Products)
                })
                .Where(x => x.Product != null && x.Product.CollectionID > 0 && x.Product.ProductID > 0)
                .ToList();

            if (parsedRows.Count == 0)
            {
                return Ok(Array.Empty<ProductionQueueItemDto>());
            }

            var collectionIds = parsedRows.Select(x => x.Product!.CollectionID).Distinct().ToList();
            var productIds = parsedRows.Select(x => x.Product!.ProductID).Distinct().ToList();
            var orderIds = parsedRows.Select(x => x.Order.OrderID).Distinct().ToList();

            var collections = await _context.Collections
                .AsNoTracking()
                .Where(collection => collectionIds.Contains(collection.CollectionID))
                .ToDictionaryAsync(collection => collection.CollectionID);

            var products = await _context.Products
                .AsNoTracking()
                .Where(product => productIds.Contains(product.ProductID))
                .ToDictionaryAsync(product => product.ProductID);

            var budgets = await _context.Budgets
                .AsNoTracking()
                .Where(b => b.CollectionID.HasValue && collectionIds.Contains(b.CollectionID.Value))
                .GroupBy(b => b.CollectionID!.Value)
                .ToDictionaryAsync(group => group.Key, group => group.OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt).First());

            var versions = await _context.ProductionVersions
                .AsNoTracking()
                .Where(version => orderIds.Contains(version.OrderID))
                .OrderByDescending(version => version.VersionID)
                .ToListAsync();
            var versionByOrder = versions
                .GroupBy(version => version.OrderID)
                .ToDictionary(group => group.Key, group => group.First());
            var boardItems = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(item => orderIds.Contains(item.OrderID))
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt)
                .ToListAsync();
            var boardByOrderAndProduct = boardItems
                .GroupBy(item => new { item.OrderID, item.ProductID })
                .ToDictionary(group => (group.Key.OrderID, group.Key.ProductID), group => group.First());

            var items = parsedRows
                .Select(row =>
                {
                    var payload = row.Product!;
                    var collection = collections.TryGetValue(payload.CollectionID, out var foundCollection)
                        ? foundCollection
                        : null;
                    var product = products.TryGetValue(payload.ProductID, out var foundProduct)
                        ? foundProduct
                        : null;
                    var budget = budgets.TryGetValue(payload.CollectionID, out var foundBudget)
                        ? foundBudget
                        : null;
                    var currentVersion = versionByOrder.TryGetValue(row.Order.OrderID, out var foundVersion)
                        ? foundVersion
                        : null;
                    var board = boardByOrderAndProduct.TryGetValue((row.Order.OrderID, payload.ProductID), out var foundBoard)
                        ? foundBoard
                        : null;

                    var queueStatus = NormalizeQueueStatus(row.Order.Status);
                    var displayVersion = string.IsNullOrWhiteSpace(board?.VersionNumber)
                        ? (string.IsNullOrWhiteSpace(row.Order.VersionNumber)
                            ? currentVersion?.VersionNumber ?? string.Empty
                            : row.Order.VersionNumber)
                        : board!.VersionNumber;
                    return new ProductionQueueItemDto
                    {
                        OrderID = row.Order.OrderID,
                        VersionID = currentVersion?.VersionID,
                        CollectionID = payload.CollectionID,
                        CollectionCode = string.IsNullOrWhiteSpace(payload.CollectionCode)
                            ? collection?.CollectionCode ?? string.Empty
                            : payload.CollectionCode,
                        CollectionName = string.IsNullOrWhiteSpace(row.Order.CollectionName)
                            ? collection?.CollectionName ?? string.Empty
                            : row.Order.CollectionName,
                        ProductID = payload.ProductID,
                        ProductSKU = string.IsNullOrWhiteSpace(payload.ProductSKU)
                            ? product?.SKU ?? string.Empty
                            : payload.ProductSKU,
                        ProductName = string.IsNullOrWhiteSpace(payload.ProductName)
                            ? product?.Name ?? string.Empty
                            : payload.ProductName,
                        BudgetID = budget?.BudgetID ?? 0,
                        BudgetCode = budget?.BudgetCode ?? string.Empty,
                        ApprovedBudget = budget?.TotalBudget ?? 0m,
                        PlannedQty = Math.Max(1, payload.PlannedQty),
                        QueueStatus = queueStatus,
                        Readiness = queueStatus == "Pending" ? "Ready" : "In Progress",
                        DueDate = row.Order.DueDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                        CurrentVersionID = currentVersion?.VersionID,
                        CurrentVersionNumber = displayVersion,
                        SuggestedVersionNumber = string.IsNullOrWhiteSpace(row.Order.VersionNumber)
                            ? currentVersion?.VersionNumber ?? "Version 1"
                            : row.Order.VersionNumber,
                        VersionNumber = displayVersion
                    };
                })
                .OrderBy(item => item.DueDate)
                .ThenBy(item => item.CollectionCode)
                .ThenBy(item => item.ProductSKU)
                .ToList();

            return Ok(items);
        }

        [HttpPost("queue/start-run")]
        public async Task<ActionResult<ProductionQueueItemDto>> StartRun([FromBody] StartProductionRunRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var order = await _context.ProductionOrders.FirstOrDefaultAsync(item => item.OrderID == request.OrderID);
            if (order == null)
            {
                return NotFound($"Production order {request.OrderID} was not found.");
            }

            var payload = ParseOrderProduct(order.Products);
            if (payload == null || payload.CollectionID != request.CollectionID || payload.ProductID != request.ProductID)
            {
                return BadRequest("Order payload does not match the selected collection/product.");
            }

            var versionNumber = (request.VersionNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(versionNumber))
            {
                return BadRequest("Version is required.");
            }

            order.Status = ProductionOrderWorkflowStatuses.ForScheduling;
            order.VersionNumber = versionNumber;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new ProductionQueueItemDto
            {
                OrderID = order.OrderID,
                CollectionID = request.CollectionID,
                ProductID = request.ProductID,
                QueueStatus = "On Going",
                VersionNumber = versionNumber,
                CurrentVersionNumber = versionNumber,
                SuggestedVersionNumber = versionNumber
            });
        }

        private static string NormalizeQueueStatus(string? status)
        {
            var normalized = (status ?? string.Empty).Trim().ToLowerInvariant();
            if (normalized.Contains("finished run")) return "Completed";
            if (normalized.Contains("unpacked")) return "Completed";
            if (normalized.Contains("batch ready")) return "On Going";
            if (normalized.Contains("run candidate")) return "On Going";
            if (normalized.Contains("schedule running")) return "On Going";
            if (normalized.Contains("for scheduling") || normalized.Contains("schedule ready") || normalized == "ready") return "On Going";
            if (normalized.Contains("finish") || normalized.Contains("complete")) return "Completed";
            if (normalized.Contains("on going") || normalized.Contains("in progress") || normalized.Contains("running")) return "On Going";
            return "Pending";
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
            public string CollectionCode { get; set; } = string.Empty;
            public int ProductID { get; set; }
            public string ProductSKU { get; set; } = string.Empty;
            public string ProductName { get; set; } = string.Empty;
            public int PlannedQty { get; set; }
        }
    }
}
