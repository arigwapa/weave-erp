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

        [HttpGet("qa")]
        public async Task<ActionResult<IEnumerable<AdminApprovalQaItemDto>>> GetQaQueue()
        {
            var rows = await BuildQaQueueAsync();

            // Admin inbox should only show actionable QA rows.
            // Exclude items already submitted for production review and keep the latest row per batch board.
            var actionable = rows
                .Where(item =>
                    !string.Equals(item.Status, "For Production Review", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(item.Status, "Sent to Inventory", StringComparison.OrdinalIgnoreCase))
                .GroupBy(item => item.BatchBoardID)
                .Select(group => group
                    .OrderByDescending(item => item.InspectionID)
                    .First())
                .ToList();

            return Ok(actionable);
        }

        [HttpGet("qa/production-review")]
        public async Task<ActionResult<IEnumerable<AdminApprovalQaItemDto>>> GetQaForProductionReview()
        {
            return Ok(await BuildQaQueueAsync("For Production Review"));
        }

        [HttpPost("qa/{inspectionId:int}/submit-production")]
        public async Task<ActionResult<AdminApprovalQaItemDto>> SubmitQaToProduction(int inspectionId)
        {
            var inspection = await _context.Inspections.FirstOrDefaultAsync(item => item.InspectionID == inspectionId);
            if (inspection == null)
            {
                return NotFound();
            }

            var board = await _context.ProductionBatchBoardItems.FirstOrDefaultAsync(item => item.BatchBoardID == inspection.BatchBoardID);
            if (board == null)
            {
                return NotFound();
            }

            board.QAStatus = "For Production Review";
            board.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var refreshed = await BuildQaQueueAsync();
            var row = refreshed.FirstOrDefault(item => item.InspectionID == inspectionId);
            return row == null ? NotFound() : Ok(row);
        }

        [HttpPost("qa/{inspectionId:int}/send-inventory")]
        public async Task<ActionResult<AdminApprovalQaItemDto>> SendQaToInventory(
            int inspectionId,
            [FromBody] AdminQaSendToInventoryRequest? request)
        {
            var inspection = await _context.Inspections.FirstOrDefaultAsync(item => item.InspectionID == inspectionId);
            if (inspection == null)
            {
                return NotFound();
            }

            var board = await _context.ProductionBatchBoardItems.FirstOrDefaultAsync(item => item.BatchBoardID == inspection.BatchBoardID);
            if (board == null)
            {
                return NotFound();
            }

            if (!string.Equals(inspection.Result, "Pass", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict("Only QA records with Pass result can be sent to inventory.");
            }

            var order = await _context.ProductionOrders.FirstOrDefaultAsync(item => item.OrderID == board.OrderID);
            var targetVersionNumber = !string.IsNullOrWhiteSpace(board.VersionNumber)
                ? board.VersionNumber
                : order?.VersionNumber;

            ProductionVersion? version = null;
            if (!string.IsNullOrWhiteSpace(targetVersionNumber))
            {
                version = await _context.ProductionVersions
                    .FirstOrDefaultAsync(item =>
                        item.OrderID == board.OrderID &&
                        item.VersionNumber == targetVersionNumber);
            }
            version ??= await _context.ProductionVersions
                .Where(item => item.OrderID == board.OrderID)
                .OrderByDescending(item => item.VersionID)
                .FirstOrDefaultAsync();

            if (version == null)
            {
                return Conflict("No production version found for this record.");
            }

            var binId = request?.BinID;
            var rawBinCode = (request?.BinCode ?? string.Empty).Trim();
            if ((!binId.HasValue || binId.Value <= 0) && !string.IsNullOrWhiteSpace(rawBinCode))
            {
                binId = await _context.BinLocations
                    .AsNoTracking()
                    .Where(item => item.BinLocationName.ToLower() == rawBinCode.ToLower())
                    .Select(item => item.BinID)
                    .FirstOrDefaultAsync();
            }
            if (!binId.HasValue || binId.Value <= 0)
            {
                binId = await _context.BinLocations
                    .AsNoTracking()
                    .OrderBy(item => item.BinID)
                    .Select(item => item.BinID)
                    .FirstOrDefaultAsync();
            }
            if (!binId.HasValue || binId.Value <= 0)
            {
                return Conflict("No bin location found. Please create a bin before sending to inventory.");
            }

            var binExists = await _context.BinLocations.AsNoTracking().AnyAsync(item => item.BinID == binId.Value);
            if (!binExists)
            {
                return NotFound($"BinID {binId.Value} was not found.");
            }

            var branchId = request?.BranchID;
            var rawBranchName = (request?.BranchName ?? string.Empty).Trim();
            Branch? selectedBranch = null;
            if (branchId.HasValue && branchId.Value > 0)
            {
                selectedBranch = await _context.Branches
                    .AsNoTracking()
                    .FirstOrDefaultAsync(item => item.BranchID == branchId.Value && item.IsActive);
            }
            else if (!string.IsNullOrWhiteSpace(rawBranchName))
            {
                selectedBranch = await _context.Branches
                    .AsNoTracking()
                    .Where(item => item.IsActive && item.BranchName.ToLower() == rawBranchName.ToLower())
                    .OrderBy(item => item.BranchID)
                    .FirstOrDefaultAsync();
            }

            if (selectedBranch == null)
            {
                return BadRequest("Please select an active branch before sending to inventory.");
            }

            var occupiedByOtherVersion = await _context.ProductionInventories
                .AsNoTracking()
                .AnyAsync(item =>
                    item.BinID == binId.Value &&
                    item.QuantityOnHand > 0 &&
                    item.VersionID != version.VersionID);
            if (occupiedByOtherVersion)
            {
                return Conflict("Selected bin is occupied. Please choose an available bin location.");
            }

            var actorUserId = await GetActorUserIdOrFallbackAsync();
            var now = DateTime.UtcNow;
            var quantity = Math.Max(0, board.Qty);
            var existingInventory = await _context.ProductionInventories
                .FirstOrDefaultAsync(item => item.VersionID == version.VersionID && item.BinID == binId.Value);

            if (existingInventory == null)
            {
                _context.ProductionInventories.Add(new ProductionInventory
                {
                    BinID = binId.Value,
                    VersionID = version.VersionID,
                    CollectionName = !string.IsNullOrWhiteSpace(board.CollectionName) ? board.CollectionName : version.CollectionName,
                    BranchName = selectedBranch.BranchName,
                    QuantityOnHand = quantity,
                    Status = "Available",
                    ReleaseTag = "Official Version",
                    SourceInspectionID = inspection.InspectionID,
                    BatchBoardID = board.BatchBoardID,
                    ProductID = board.ProductID > 0 ? board.ProductID : version.ProductID,
                    ReceivedAt = now,
                    CreatedByUserID = actorUserId,
                    CreatedAt = now,
                    UpdatedByUserID = actorUserId,
                    UpdatedAt = now
                });
            }
            else
            {
                existingInventory.QuantityOnHand += quantity;
                existingInventory.Status = "Available";
                existingInventory.ReleaseTag = "Official Version";
                existingInventory.CollectionName = !string.IsNullOrWhiteSpace(board.CollectionName)
                    ? board.CollectionName
                    : existingInventory.CollectionName;
                existingInventory.BranchName = selectedBranch.BranchName;
                existingInventory.SourceInspectionID = inspection.InspectionID;
                existingInventory.BatchBoardID = board.BatchBoardID;
                existingInventory.ProductID = board.ProductID > 0 ? board.ProductID : existingInventory.ProductID;
                existingInventory.ReceivedAt = now;
                existingInventory.UpdatedByUserID = actorUserId;
                existingInventory.UpdatedAt = now;
            }

            board.QAStatus = "Sent to Inventory";
            board.UpdatedAt = now;
            await _context.SaveChangesAsync();

            var refreshed = await BuildQaQueueAsync();
            var row = refreshed.FirstOrDefault(item => item.InspectionID == inspectionId);
            return row == null ? NotFound() : Ok(row);
        }

        [HttpPost("qa/{inspectionId:int}/send-production-queue")]
        public async Task<ActionResult<AdminApprovalQaItemDto>> SendQaToProductionQueue(int inspectionId)
        {
            var inspection = await _context.Inspections.FirstOrDefaultAsync(item => item.InspectionID == inspectionId);
            if (inspection == null)
            {
                return NotFound();
            }

            var board = await _context.ProductionBatchBoardItems.FirstOrDefaultAsync(item => item.BatchBoardID == inspection.BatchBoardID);
            if (board == null)
            {
                return NotFound();
            }

            var order = await _context.ProductionOrders.FirstOrDefaultAsync(item => item.OrderID == board.OrderID);
            var nextVersion = IncrementVersionLabel(
                board.VersionNumber,
                order?.VersionNumber);
            var previousVersion = string.IsNullOrWhiteSpace(order?.VersionNumber)
                ? board.VersionNumber
                : order!.VersionNumber;

            var versionForOrderAtNext = await _context.ProductionVersions
                .FirstOrDefaultAsync(item => item.OrderID == board.OrderID && item.VersionNumber == nextVersion);
            if (versionForOrderAtNext == null)
            {
                var linkedVersion = await _context.ProductionVersions
                    .FirstOrDefaultAsync(item =>
                        item.OrderID == board.OrderID &&
                        item.VersionNumber == previousVersion);
                if (linkedVersion == null)
                {
                    return Conflict("Unable to resolve linked production version for this order.");
                }

                // Keep the same VersionID row and update only VersionNumber.
                if (order != null)
                {
                    order.VersionNumber = null;
                    order.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                var versionUpdatedAt = DateTime.UtcNow;
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE [ProductionVersion] SET [VersionNumber] = {nextVersion}, [UpdatedAt] = {versionUpdatedAt} WHERE [VersionID] = {linkedVersion.VersionID}");
            }

            board.QAStatus = "Pending";
            board.Status = "Pending";
            board.VersionNumber = nextVersion;
            board.Version = nextVersion;
            board.UpdatedAt = DateTime.UtcNow;

            if (order != null)
            {
                order.Status = "Pending";
                order.VersionNumber = nextVersion;
                order.UpdatedAt = DateTime.UtcNow;
            }

            var linkedSchedule = await _context.RunSchedules
                .FirstOrDefaultAsync(item =>
                    item.CollectionID == board.CollectionID &&
                    item.ProductID == board.ProductID);
            if (linkedSchedule != null)
            {
                _context.RunSchedules.Remove(linkedSchedule);
            }

            await _context.SaveChangesAsync();

            var refreshed = await BuildQaQueueAsync();
            var row = refreshed.FirstOrDefault(item => item.InspectionID == inspectionId);
            return row == null ? NotFound() : Ok(row);
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

            var actorUserId = await GetActorUserIdOrFallbackAsync();
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

        private async Task<int> GetActorUserIdOrFallbackAsync()
        {
            var claimUserId = GetActorUserId();
            if (claimUserId.HasValue)
            {
                var exists = await _context.Users.AsNoTracking().AnyAsync(user => user.UserID == claimUserId.Value);
                if (exists)
                {
                    return claimUserId.Value;
                }
            }

            var fallbackUserId = await _context.Users
                .AsNoTracking()
                .OrderBy(user => user.UserID)
                .Select(user => user.UserID)
                .FirstOrDefaultAsync();

            return fallbackUserId > 0 ? fallbackUserId : 1;
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
            var matchedProductIds = matchedProducts
                .Select(product => product.ProductID)
                .Distinct()
                .ToList();

            // Reset run scheduler entries for this collection/products so newly approved rows
            // appear in Production Queue with Pending status until Start is clicked again.
            if (matchedProductIds.Count > 0)
            {
                var existingSchedules = await _context.RunSchedules
                    .Where(schedule =>
                        schedule.CollectionID == collection.CollectionID &&
                        matchedProductIds.Contains(schedule.ProductID))
                    .ToListAsync();
                if (existingSchedules.Count > 0)
                {
                    _context.RunSchedules.RemoveRange(existingSchedules);
                    await _context.SaveChangesAsync();
                }
            }

            var existingPendingOrders = await _context.ProductionOrders
                .Where(order =>
                    order.CollectionName == collection.CollectionName &&
                    (order.Status == "Pending" || order.Status == "For Scheduling" || order.Status == "Schedule Ready"))
                .ToListAsync();
            if (existingPendingOrders.Count > 0)
            {
                // Break the composite FK dependency (OrderID, VersionNumber) before deleting related rows.
                foreach (var pendingOrder in existingPendingOrders)
                {
                    pendingOrder.VersionNumber = null;
                    pendingOrder.UpdatedAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();

                var pendingOrderIds = existingPendingOrders.Select(order => order.OrderID).ToList();
                var existingVersions = await _context.ProductionVersions
                    .Where(version => pendingOrderIds.Contains(version.OrderID))
                    .ToListAsync();
                if (existingVersions.Count > 0)
                {
                    _context.ProductionVersions.RemoveRange(existingVersions);
                }
                _context.ProductionOrders.RemoveRange(existingPendingOrders);
                await _context.SaveChangesAsync();
            }

            var dueDate = DateOnly.FromDateTime(collection.TargetLaunchDate);
            var now = DateTime.UtcNow;
            var createdOrders = new List<(ProductionOrder Order, Product Product)>();
            var nextOrderId = await _context.ProductionOrders
                .AsNoTracking()
                .Select(order => (int?)order.OrderID)
                .MaxAsync() ?? 0;
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
                    OrderID = ++nextOrderId,
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

        private static string IncrementVersionLabel(string? primary, string? fallback)
        {
            var source = string.IsNullOrWhiteSpace(primary) ? fallback : primary;
            var current = ParseVersionNumber(source);
            var next = current <= 0 ? 2 : current + 1;
            return $"Version {next}";
        }

        private static string MapAdminQueueStatus(string collectionStatus, string? adminDecision)
        {
            var source = (adminDecision ?? collectionStatus ?? string.Empty).Trim().ToLowerInvariant();
            if (source.Contains("approved") || source.Contains("released to production")) return "Approved";
            if (source.Contains("revision")) return "Revised";
            if (source.Contains("rejected")) return "Rejected";
            return "Submitted";
        }

        private async Task<List<AdminApprovalQaItemDto>> BuildQaQueueAsync(string? requiredQaStatus = null)
        {
            var inspections = await _context.Inspections
                .AsNoTracking()
                .OrderByDescending(item => item.InspectionDate)
                .ToListAsync();
            if (inspections.Count == 0)
            {
                return new List<AdminApprovalQaItemDto>();
            }

            var batchBoardIds = inspections.Select(item => item.BatchBoardID).Distinct().ToList();
            var senderUserIds = inspections.Select(item => item.UserID).Distinct().ToList();
            var boards = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(item => batchBoardIds.Contains(item.BatchBoardID))
                .ToListAsync();
            var boardById = boards.ToDictionary(item => item.BatchBoardID);
            var senderNameByUserId = await _context.Users
                .AsNoTracking()
                .Where(item => senderUserIds.Contains(item.UserID))
                .ToDictionaryAsync(item => item.UserID, item => item.Username);

            var rows = inspections.Select(item =>
            {
                var hasBoard = boardById.TryGetValue(item.BatchBoardID, out var board);
                var batchNumber = hasBoard ? board!.Code : "-";
                var senderName = senderNameByUserId.TryGetValue(item.UserID, out var mappedSenderName)
                    ? mappedSenderName
                    : "QA Sender";
                var qaStatus = hasBoard ? board!.QAStatus : string.Empty;

                return new AdminApprovalQaItemDto
                {
                    InspectionID = item.InspectionID,
                    BatchBoardID = item.BatchBoardID,
                    BatchNumber = batchNumber,
                    UserID = item.UserID,
                    ProductVersion = hasBoard ? board!.VersionNumber : string.Empty,
                    ProductName = hasBoard ? board!.Product : string.Empty,
                    Result = item.Result,
                    Status = string.IsNullOrWhiteSpace(qaStatus) ? item.Result : qaStatus,
                    InspectionDate = item.InspectionDate.ToString("O"),
                    SenderName = senderName,
                    AQLLevel = item.AQLLevel,
                    InspectionLevel = item.InspectionLevel,
                    SampleSize = item.SampleSize,
                    DefectsFound = item.DefectsFound,
                    AcceptThreshold = item.AcceptThreshold,
                    RejectThreshold = item.RejectThreshold,
                    Notes = item.Notes ?? string.Empty
                };
            });

            if (!string.IsNullOrWhiteSpace(requiredQaStatus))
            {
                var filteredRows = rows
                    .Where(item => string.Equals(item.Status, requiredQaStatus, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                // Only keep the latest inspection per batch board in production-review queue,
                // so submitting one row does not surface historical inspections for the same batch.
                return filteredRows
                    .GroupBy(item => item.BatchBoardID)
                    .Select(group => group
                        .OrderByDescending(item => item.InspectionID)
                        .First())
                    .ToList();
            }

            return rows.ToList();
        }
    }
}
