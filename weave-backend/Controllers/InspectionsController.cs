using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;
using weave_erp_backend_api.Services;

namespace weave_erp_backend_api.Controllers
{
    [ApiController]
    [Route("api/inspection")]
    public class InspectionsController : GenericCrudController<Inspection>
    {
        private readonly AppDbContext _context;
        private readonly InspectionWorkflowService _workflowService;

        public InspectionsController(AppDbContext context, InspectionWorkflowService workflowService) : base(context, "InspectionID")
        {
            _context = context;
            _workflowService = workflowService;
        }

        [HttpGet("priority-queue")]
        public async Task<ActionResult<IEnumerable<InspectionPriorityQueueItemDto>>> GetPriorityQueue()
        {
            var rows = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(item =>
                    (item.QAStatus ?? string.Empty).Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
                    ((item.QAStatus ?? string.Empty) == string.Empty && item.Status == "Submitted"))
                .OrderByDescending(item => item.UpdatedAt ?? item.CreatedAt)
                .ThenByDescending(item => item.BatchBoardID)
                .Select(item => new InspectionPriorityQueueItemDto
                {
                    BatchBoardID = item.BatchBoardID,
                    BatchCode = item.Code,
                    VersionNumber = item.VersionNumber,
                    ProductName = string.IsNullOrWhiteSpace(item.Product) ? item.ProductSKU : item.Product,
                    CollectionName = item.CollectionName,
                    Size = item.Size,
                    Qty = item.Qty,
                    Status = item.Status,
                    SubmittedAt = (item.UpdatedAt ?? item.CreatedAt).ToString("yyyy-MM-dd HH:mm")
                })
                .ToListAsync();

            return Ok(rows);
        }

        [HttpGet("checklist-template")]
        public async Task<ActionResult<IEnumerable<InspectionChecklistTemplateDto>>> GetChecklistTemplate()
        {
            var rows = await _context.InspectionChecklistTemplates
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.SequenceNo)
                .Select(x => new InspectionChecklistTemplateDto
                {
                    ChecklistTemplateID = x.ChecklistTemplateID,
                    ChecklistCode = x.ChecklistCode,
                    ChecklistName = x.ChecklistName,
                    Category = x.Category,
                    SequenceNo = x.SequenceNo,
                    IsRequired = x.IsRequired
                })
                .ToListAsync();

            return Ok(rows);
        }

        [HttpPost("start")]
        public async Task<ActionResult<InProgressInspectionDto>> StartInspection([FromBody] StartInspectionRequestDto request)
        {
            if (request == null || request.BatchBoardID <= 0)
            {
                return BadRequest("BatchBoardID is required.");
            }

            var batch = await _context.ProductionBatchBoardItems
                .FirstOrDefaultAsync(item => item.BatchBoardID == request.BatchBoardID);
            if (batch == null)
            {
                return NotFound("Batch not found.");
            }
            var isSubmitted = string.Equals(batch.Status, "Submitted", StringComparison.OrdinalIgnoreCase);
            var isPendingQa = string.Equals(batch.QAStatus, "Pending", StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(batch.QAStatus);
            var isForInspection = string.Equals(batch.QAStatus, "For Inspection", StringComparison.OrdinalIgnoreCase);
            if (!isSubmitted && !isPendingQa && !isForInspection)
            {
                return BadRequest("Only submitted batches can start inspection.");
            }

            var now = DateTime.UtcNow;
            if (!isForInspection)
            {
                batch.QAStatus = "For Inspection";
                batch.QAStartedByUserID = TryGetCurrentUserId();
                batch.QAStartedAt = now;
                batch.Status = "For Inspection";
                batch.UpdatedAt = now;
                await _context.SaveChangesAsync();
            }

            return Ok(ToInProgressDto(null, batch));
        }

        [HttpPost("finish")]
        public async Task<ActionResult<object>> FinalizeInspection([FromBody] FinalizeInspectionRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Request payload is required.");
            }

            var checklistRows = (request.Checklist ?? new List<InspectionChecklistEntryDto>())
                .Select((x, idx) => new SaveInspectionChecklistResultDto
                {
                    ChecklistTemplateID = idx + 1,
                    ChecklistStatus = x.Approved ? "Pass" : "Fail",
                    Remarks = null
                })
                .ToList();

            var defectRows = request.Defects?.Count > 0
                ? request.Defects
                : BuildDefectRowsFromLegacyFields(request);

            var saveRequest = new SaveInspectionRequestDto
            {
                BatchBoardID = request.BatchBoardID,
                AQLLevel = request.AQLLevel,
                InspectionLevel = request.InspectionLevel,
                SampleSize = Math.Max(1, request.SampleSize),
                AcceptThreshold = Math.Max(0, request.AcceptThreshold),
                RejectThreshold = Math.Max(0, request.RejectThreshold),
                Notes = request.Notes,
                AutoCreateCapaDraft = request.AutoCreateCapaDraft,
                ChecklistResults = checklistRows,
                Defects = defectRows,
                Attachments = request.Attachments ?? new List<SaveInspectionAttachmentDto>()
            };

            var userId = TryGetCurrentUserId() ?? 1;
            try
            {
                var result = await _workflowService.SaveInspectionAsync(saveRequest, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException ex) when (IsLegacyInspectionBatchFkError(ex))
            {
                return Problem("Inspection FK mismatch");
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpPost("save")]
        public async Task<ActionResult<SaveInspectionResponseDto>> SaveInspection([FromBody] SaveInspectionRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var userId = TryGetCurrentUserId() ?? 1;
            try
            {
                var result = await _workflowService.SaveInspectionAsync(request, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException ex) when (IsLegacyInspectionBatchFkError(ex))
            {
                return Problem("Inspection FK mismatch");
            }
            catch (Exception ex)
            {
                return Problem(ex.Message);
            }
        }

        [HttpGet("completed")]
        public async Task<ActionResult<IEnumerable<InspectionHistoryItemDto>>> GetCompleted()
        {
            var result = await BuildHistoryAsync();
            return Ok(result);
        }

        [HttpGet("{id:int}/details")]
        public async Task<ActionResult<InspectionDetailDto>> GetDetails(int id)
        {
            var inspection = await _context.Inspections.AsNoTracking().FirstOrDefaultAsync(x => x.InspectionID == id);
            if (inspection == null)
            {
                return NotFound();
            }

            var batch = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.BatchBoardID == inspection.BatchBoardID);
            var inspector = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserID == inspection.UserID);

            var checklist = await (
                from resultRow in _context.InspectionChecklistResults.AsNoTracking()
                join template in _context.InspectionChecklistTemplates.AsNoTracking()
                    on resultRow.ChecklistTemplateID equals template.ChecklistTemplateID
                where resultRow.InspectionID == inspection.InspectionID
                orderby template.SequenceNo
                select new InspectionChecklistResultDetailDto
                {
                    ChecklistResultID = resultRow.ChecklistResultID,
                    ChecklistTemplateID = resultRow.ChecklistTemplateID,
                    ChecklistCode = template.ChecklistCode,
                    ChecklistName = template.ChecklistName,
                    ChecklistStatus = resultRow.ChecklistStatus,
                    Remarks = resultRow.Remarks
                }
            ).ToListAsync();

            var defects = await _context.InspectionDefects
                .AsNoTracking()
                .Where(x => x.InspectionID == inspection.InspectionID)
                .OrderByDescending(x => x.AffectedQuantity)
                .Select(x => new InspectionDefectDetailDto
                {
                    InspectionDefectID = x.InspectionDefectID,
                    DefectType = x.DefectType,
                    DefectCategory = x.DefectCategory,
                    DefectDescription = x.DefectDescription,
                    AffectedQuantity = x.AffectedQuantity,
                    SeverityScore = x.SeverityScore,
                    Remarks = x.Remarks
                })
                .ToListAsync();

            var response = new InspectionDetailDto
            {
                InspectionID = inspection.InspectionID,
                BatchBoardID = inspection.BatchBoardID,
                BatchNumber = batch?.Code ?? string.Empty,
                ProductName = batch == null ? string.Empty : (string.IsNullOrWhiteSpace(batch.Product) ? batch.ProductSKU : batch.Product),
                VersionNumber = batch?.VersionNumber ?? string.Empty,
                CollectionName = batch?.CollectionName ?? string.Empty,
                Inspector = inspector?.Fullname ?? $"User #{inspection.UserID}",
                AQLLevel = inspection.AQLLevel,
                InspectionLevel = inspection.InspectionLevel,
                SampleSize = inspection.SampleSize,
                DefectsFound = inspection.DefectsFound,
                AcceptThreshold = inspection.AcceptThreshold,
                RejectThreshold = inspection.RejectThreshold,
                Result = ToUiResult(inspection.Result),
                Notes = inspection.Notes ?? string.Empty,
                InspectionDate = inspection.InspectionDate,
                ChecklistResults = checklist,
                Defects = defects,
                Attachments = new List<InspectionAttachmentDetailDto>()
            };

            return Ok(response);
        }

        private static List<SaveInspectionDefectDto> BuildDefectRowsFromLegacyFields(FinalizeInspectionRequestDto request)
        {
            var rows = new List<SaveInspectionDefectDto>();
            var critical = Math.Max(0, request.DefectsFound);
            if (critical > 0)
            {
                rows.Add(new SaveInspectionDefectDto
                {
                    DefectType = "Critical",
                    DefectCategory = "Legacy",
                    DefectDescription = "Legacy defect entry",
                    AffectedQuantity = critical,
                    Remarks = string.Join(" | ", new[]
                    {
                        request.CriticalDefectReason,
                        request.MajorDefectReason,
                        request.MinorDefectReason
                    }.Where(x => !string.IsNullOrWhiteSpace(x)))
                });
            }
            return rows;
        }

        private async Task<List<InspectionHistoryItemDto>> BuildHistoryAsync()
        {
            var rows = await _context.Inspections
                .AsNoTracking()
                .OrderByDescending(x => x.InspectionDate)
                .ThenByDescending(x => x.InspectionID)
                .ToListAsync();

            if (rows.Count == 0)
            {
                return new List<InspectionHistoryItemDto>();
            }

            var batchIds = rows.Select(x => x.BatchBoardID).Distinct().ToList();
            var userIds = rows.Select(x => x.UserID).Distinct().ToList();

            var batchLookup = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(item => batchIds.Contains(item.BatchBoardID))
                .ToDictionaryAsync(item => item.BatchBoardID);
            var userLookup = await _context.Users
                .AsNoTracking()
                .Where(user => userIds.Contains(user.UserID))
                .ToDictionaryAsync(user => user.UserID);

            return rows.Select(item =>
            {
                batchLookup.TryGetValue(item.BatchBoardID, out var batch);
                userLookup.TryGetValue(item.UserID, out var inspector);
                return new InspectionHistoryItemDto
                {
                    InspectionID = item.InspectionID,
                    BatchBoardID = item.BatchBoardID,
                    BatchCode = batch?.Code ?? string.Empty,
                    VersionNumber = batch?.VersionNumber ?? string.Empty,
                    ProductName = batch == null
                        ? string.Empty
                        : (string.IsNullOrWhiteSpace(batch.Product) ? batch.ProductSKU : batch.Product),
                    CollectionName = batch?.CollectionName ?? string.Empty,
                    InspectorName = inspector?.Fullname ?? $"User #{item.UserID}",
                    UserID = item.UserID,
                    AQLLevel = item.AQLLevel,
                    InspectionLevel = item.InspectionLevel,
                    SampleSize = item.SampleSize,
                    DefectsFound = item.DefectsFound,
                    AcceptThreshold = item.AcceptThreshold,
                    RejectThreshold = item.RejectThreshold,
                    Result = ToUiResult(item.Result),
                    QaDecision = ToUiResult(item.Result),
                    DefectEntries = null,
                    Notes = item.Notes,
                    InspectionDate = item.InspectionDate,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    Status = "Inspection Finished"
                };
            }).ToList();
        }

        [HttpGet("in-progress")]
        public async Task<ActionResult<IEnumerable<InProgressInspectionDto>>> GetInProgress()
        {
            var startedBatches = await _context.ProductionBatchBoardItems
                .AsNoTracking()
                .Where(item => (item.QAStatus ?? string.Empty) == "For Inspection")
                .OrderByDescending(item => item.QAStartedAt ?? item.UpdatedAt ?? item.CreatedAt)
                .ToListAsync();

            if (startedBatches.Count == 0)
            {
                return Ok(Array.Empty<InProgressInspectionDto>());
            }

            var result = startedBatches
                .Select(batch =>
                {
                    return ToInProgressDto(null, batch);
                })
                .ToList();
            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<InspectionHistoryItemDto>>> GetHistory()
        {
            var result = await BuildHistoryAsync();
            return Ok(result);
        }

        private static InProgressInspectionDto ToInProgressDto(Inspection? inspection, ProductionBatchBoardItem batch)
        {
            return new InProgressInspectionDto
            {
                InspectionID = inspection?.InspectionID ?? 0,
                BatchBoardID = batch.BatchBoardID,
                BatchCode = batch.Code,
                ProductName = string.IsNullOrWhiteSpace(batch.Product) ? batch.ProductSKU : batch.Product,
                CollectionName = batch.CollectionName,
                ProductionRun = batch.RunCode,
                BranchWarehouse = "N/A",
                DateSubmitted = batch.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                VersionNumber = batch.VersionNumber,
                Size = batch.Size,
                Qty = batch.Qty,
                InspectionLevel = string.IsNullOrWhiteSpace(inspection?.InspectionLevel) ? "Normal" : inspection!.InspectionLevel,
                AQLLevel = string.IsNullOrWhiteSpace(inspection?.AQLLevel) ? "General II" : inspection!.AQLLevel,
                Result = "For Inspection",
                StartedByUserID = batch.QAStartedByUserID ?? 0,
                BatchStatus = string.IsNullOrWhiteSpace(batch.QAStatus) ? "For Inspection" : batch.QAStatus,
                StartedAt = (batch.QAStartedAt ?? batch.UpdatedAt ?? batch.CreatedAt).ToString("yyyy-MM-dd HH:mm")
            };
        }

        private static (string QaDecision, string InspectionResult, string UiResult) EvaluateInspectionOutcome(FinalizeInspectionRequestDto request)
        {
            var defectsFound = Math.Max(0, request.DefectsFound);
            var acceptThreshold = Math.Max(0, request.AcceptThreshold);
            var rejectThreshold = Math.Max(0, request.RejectThreshold);

            if (defectsFound <= acceptThreshold)
            {
                return ("Approved", "Pass", "Accepted");
            }

            if (rejectThreshold > 0 && defectsFound >= rejectThreshold)
            {
                return ("Disapproved", "Fail", "Rejected");
            }

            return ("Review Required", "Fail", "Review Required");
        }

        private static string ToUiResult(string? dbResult)
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

        private static (string QaDecision, string? DefectEntries, string? Notes, string DerivedResult) ParseNotesPayload(string? rawNotes)
        {
            if (string.IsNullOrWhiteSpace(rawNotes))
            {
                return (string.Empty, null, null, string.Empty);
            }

            try
            {
                using var document = JsonDocument.Parse(rawNotes);
                var root = document.RootElement;
                string qaDecision = TryGetString(root, "qaDecision");
                string defectEntries = TryGetString(root, "defectEntries");
                string notes = TryGetString(root, "notes");
                string derivedResult = TryGetString(root, "derivedResult");
                return (
                    qaDecision,
                    string.IsNullOrWhiteSpace(defectEntries) ? null : defectEntries,
                    string.IsNullOrWhiteSpace(notes) ? null : notes,
                    derivedResult
                );
            }
            catch
            {
                return (string.Empty, null, rawNotes, string.Empty);
            }
        }

        private static string TryGetString(JsonElement root, string propertyName)
        {
            if (!root.TryGetProperty(propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
            {
                return string.Empty;
            }

            return value.ValueKind == JsonValueKind.String ? value.GetString() ?? string.Empty : value.ToString();
        }

        private static string NormalizeUiResult(string rawResult, int defectsFound, int acceptThreshold)
        {
            var value = (rawResult ?? string.Empty).Trim().ToLowerInvariant();
            if (value == "accepted" || value == "rejected" || value == "review required")
            {
                return value switch
                {
                    "accepted" => "Accepted",
                    "rejected" => "Rejected",
                    _ => "Review Required"
                };
            }

            return defectsFound <= acceptThreshold ? "Accepted" : "Rejected";
        }

        private int? TryGetCurrentUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(raw, out var parsed) ? parsed : null;
        }

        private static bool IsLegacyInspectionBatchFkError(DbUpdateException ex)
        {
            var message = (ex.InnerException?.Message ?? ex.Message ?? string.Empty).ToLowerInvariant();
            return message.Contains("fk_inspection_batch")
                || message.Contains("fk_inspection_productionbatch")
                || (message.Contains("foreign key") && message.Contains("inspection") && message.Contains("productionbatch"));
        }

    }
}
