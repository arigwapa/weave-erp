using Microsoft.EntityFrameworkCore;
using weave_erp_backend_api.Dtos;
using weave_erp_backend_api.Models;

namespace weave_erp_backend_api.Services
{
    public class InspectionWorkflowService
    {
        private readonly AppDbContext _context;

        public InspectionWorkflowService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SaveInspectionResponseDto> SaveInspectionAsync(
            SaveInspectionRequestDto request,
            int currentUserId,
            CancellationToken cancellationToken = default)
        {
            if (request.SampleSize <= 0)
            {
                throw new InvalidOperationException("SampleSize must be greater than 0.");
            }

            if (request.AcceptThreshold > request.RejectThreshold)
            {
                throw new InvalidOperationException("AcceptThreshold must be less than or equal to RejectThreshold.");
            }

            if (request.ChecklistResults.Count == 0)
            {
                throw new InvalidOperationException("At least one checklist item should be answered.");
            }

            foreach (var defect in request.Defects)
            {
                if (string.IsNullOrWhiteSpace(defect.DefectType))
                {
                    throw new InvalidOperationException("Each defect row must have DefectType.");
                }
                if (defect.AffectedQuantity <= 0)
                {
                    throw new InvalidOperationException("Each defect row must have AffectedQuantity greater than 0.");
                }
            }

            var batch = await _context.ProductionBatchBoardItems
                .FirstOrDefaultAsync(x => x.BatchBoardID == request.BatchBoardID, cancellationToken);
            if (batch == null)
            {
                throw new InvalidOperationException("BatchBoardID not found.");
            }

            var status = (batch.QAStatus ?? string.Empty).Trim();
            if (!status.Equals("For Inspection", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Batch must be in 'For Inspection' before saving inspection.");
            }

            var templateIds = request.ChecklistResults.Select(x => x.ChecklistTemplateID).Distinct().ToList();
            var activeTemplateIds = await _context.InspectionChecklistTemplates
                .AsNoTracking()
                .Where(x => x.IsActive && templateIds.Contains(x.ChecklistTemplateID))
                .Select(x => x.ChecklistTemplateID)
                .ToListAsync(cancellationToken);

            if (templateIds.Any(id => !activeTemplateIds.Contains(id)))
            {
                throw new InvalidOperationException("One or more checklist items are invalid or inactive.");
            }

            var now = DateTime.UtcNow;
            var defectsFound = request.Defects.Sum(x => Math.Max(0, x.AffectedQuantity));
            var (dbResult, uiResult) = ComputeResult(defectsFound, request.AcceptThreshold, request.RejectThreshold);
            var finalInspectionDate = request.InspectionDate ?? now;

            await using var tx = await _context.Database.BeginTransactionAsync(cancellationToken);
            try
            {
                var inspection = new Inspection
                {
                    BatchBoardID = request.BatchBoardID,
                    UserID = currentUserId,
                    AQLLevel = request.AQLLevel.Trim(),
                    InspectionLevel = request.InspectionLevel.Trim(),
                    SampleSize = request.SampleSize,
                    DefectsFound = defectsFound,
                    AcceptThreshold = request.AcceptThreshold,
                    RejectThreshold = request.RejectThreshold,
                    Result = dbResult,
                    Notes = request.Notes?.Trim(),
                    InspectionDate = finalInspectionDate,
                    CreatedByUserID = currentUserId,
                    CreatedAt = now,
                    UpdatedByUserID = currentUserId,
                    UpdatedAt = now
                };
                _context.Inspections.Add(inspection);
                await _context.SaveChangesAsync(cancellationToken);

                var checklistRows = request.ChecklistResults.Select(item => new InspectionChecklistResult
                {
                    InspectionID = inspection.InspectionID,
                    ChecklistTemplateID = item.ChecklistTemplateID,
                    ChecklistStatus = NormalizeChecklistStatus(item.ChecklistStatus),
                    Remarks = string.IsNullOrWhiteSpace(item.Remarks) ? null : item.Remarks.Trim(),
                    CreatedByUserID = currentUserId,
                    CreatedAt = now,
                    UpdatedByUserID = currentUserId,
                    UpdatedAt = now
                });
                _context.InspectionChecklistResults.AddRange(checklistRows);

                if (request.Defects.Count > 0)
                {
                    var defectRows = request.Defects.Select(item => new InspectionDefect
                    {
                        InspectionID = inspection.InspectionID,
                        DefectType = NormalizeDefectType(item.DefectType),
                        DefectCategory = item.DefectCategory.Trim(),
                        DefectDescription = item.DefectDescription.Trim(),
                        AffectedQuantity = Math.Max(1, item.AffectedQuantity),
                        SeverityScore = item.SeverityScore,
                        Remarks = string.IsNullOrWhiteSpace(item.Remarks) ? null : item.Remarks.Trim(),
                        CreatedByUserID = currentUserId,
                        CreatedAt = now,
                        UpdatedByUserID = currentUserId,
                        UpdatedAt = now
                    });
                    _context.InspectionDefects.AddRange(defectRows);
                }

                if (request.Attachments.Count > 0)
                {
                    var attachmentRows = request.Attachments
                        .Where(item => !string.IsNullOrWhiteSpace(item.FileName) && !string.IsNullOrWhiteSpace(item.FileUrl))
                        .Select(item => new InspectionAttachment
                        {
                            InspectionID = inspection.InspectionID,
                            FileName = item.FileName.Trim(),
                            FileUrl = item.FileUrl.Trim(),
                            FileType = string.IsNullOrWhiteSpace(item.FileType) ? "Other" : item.FileType.Trim(),
                            Remarks = string.IsNullOrWhiteSpace(item.Remarks) ? null : item.Remarks.Trim(),
                            UploadedByUserID = currentUserId,
                            UploadedAt = now
                        });
                    _context.InspectionAttachments.AddRange(attachmentRows);
                }

                batch.QAStatus = "Inspection Finished";
                batch.QAStartedByUserID ??= currentUserId;
                batch.QAStartedAt ??= now;
                batch.Status = "Inspection Finished";
                batch.UpdatedAt = now;

                bool capaCreated = false;
                int? capaId = null;
                if (uiResult == "Rejected" && request.AutoCreateCapaDraft)
                {
                    var capa = new CAPA
                    {
                        InspectionID = inspection.InspectionID,
                        IssueTitle = $"Rejected batch {batch.Code}",
                        RootCause = null,
                        CorrectiveAction = null,
                        PreventiveAction = null,
                        ResponsibleDepartment = "Production",
                        ResponsibleUserID = null,
                        DueDate = null,
                        Status = "Open",
                        CreatedByUserID = currentUserId,
                        CreatedAt = now,
                        UpdatedByUserID = currentUserId,
                        UpdatedAt = now
                    };
                    _context.CAPAs.Add(capa);
                    capaCreated = true;
                    await _context.SaveChangesAsync(cancellationToken);
                    capaId = capa.CAPAID;
                }
                else
                {
                    await _context.SaveChangesAsync(cancellationToken);
                }

                await tx.CommitAsync(cancellationToken);
                return new SaveInspectionResponseDto
                {
                    InspectionID = inspection.InspectionID,
                    BatchBoardID = inspection.BatchBoardID,
                    DefectsFound = defectsFound,
                    Result = uiResult,
                    DbResult = dbResult,
                    CapaDraftCreated = capaCreated,
                    CapaID = capaId
                };
            }
            catch
            {
                await tx.RollbackAsync(cancellationToken);
                throw;
            }
        }

        private static (string DbResult, string UiResult) ComputeResult(int defectsFound, int acceptThreshold, int rejectThreshold)
        {
            if (defectsFound <= acceptThreshold)
            {
                return ("Pass", "Accepted");
            }

            if (defectsFound >= rejectThreshold)
            {
                return ("Fail", "Rejected");
            }

            return ("Hold", "Review Required");
        }

        private static string NormalizeChecklistStatus(string status)
        {
            var value = (status ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "pass" => "Pass",
                "fail" => "Fail",
                "n/a" => "N/A",
                "na" => "N/A",
                _ => "Pass"
            };
        }

        private static string NormalizeDefectType(string defectType)
        {
            var value = (defectType ?? string.Empty).Trim().ToLowerInvariant();
            return value switch
            {
                "critical" => "Critical",
                "major" => "Major",
                _ => "Minor"
            };
        }
    }
}
