using System.ComponentModel.DataAnnotations;

namespace weave_erp_backend_api.Dtos
{
    public class QaBatchQueueItemDto
    {
        public int BatchBoardID { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public int QuantityProduced { get; set; }
        public string DateSubmitted { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Inspector { get; set; } = string.Empty;
        public string? StartedAt { get; set; }
        public string? InspectionDate { get; set; }
        public int? SampleSize { get; set; }
        public int? DefectsFound { get; set; }
        public string? Result { get; set; }
    }

    public class InspectionChecklistTemplateDto
    {
        public int ChecklistTemplateID { get; set; }
        public string ChecklistCode { get; set; } = string.Empty;
        public string ChecklistName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int SequenceNo { get; set; }
        public bool IsRequired { get; set; }
    }

    public class SaveInspectionChecklistResultDto
    {
        [Range(1, int.MaxValue)]
        public int ChecklistTemplateID { get; set; }

        [Required, StringLength(20)]
        public string ChecklistStatus { get; set; } = "Pass";

        [StringLength(255)]
        public string? Remarks { get; set; }
    }

    public class SaveInspectionDefectDto
    {
        [Required, StringLength(20)]
        public string DefectType { get; set; } = "Minor";

        [Required, StringLength(100)]
        public string DefectCategory { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string DefectDescription { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int AffectedQuantity { get; set; }

        public int? SeverityScore { get; set; }

        [StringLength(255)]
        public string? Remarks { get; set; }
    }

    public class SaveInspectionAttachmentDto
    {
        [Required, StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string FileUrl { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string FileType { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Remarks { get; set; }
    }

    public class SaveInspectionRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Batch board ID must be greater than 0.")]
        public int BatchBoardID { get; set; }

        [Required, StringLength(40)]
        public string AQLLevel { get; set; } = string.Empty;

        [Required, StringLength(40)]
        public string InspectionLevel { get; set; } = string.Empty;

        [Range(1, int.MaxValue)]
        public int SampleSize { get; set; }

        [Range(0, int.MaxValue)]
        public int AcceptThreshold { get; set; }

        [Range(0, int.MaxValue)]
        public int RejectThreshold { get; set; }

        public DateTime? InspectionDate { get; set; }
        public string? Notes { get; set; }
        public bool AutoCreateCapaDraft { get; set; } = true;

        public List<SaveInspectionChecklistResultDto> ChecklistResults { get; set; } = new();
        public List<SaveInspectionDefectDto> Defects { get; set; } = new();
        public List<SaveInspectionAttachmentDto> Attachments { get; set; } = new();
    }

    public class SaveInspectionResponseDto
    {
        public int InspectionID { get; set; }
        public int BatchBoardID { get; set; }
        public int DefectsFound { get; set; }
        public string Result { get; set; } = string.Empty;
        public string DbResult { get; set; } = string.Empty;
        public bool CapaDraftCreated { get; set; }
        public int? CapaID { get; set; }
    }

    public class InspectionDetailDto
    {
        public int InspectionID { get; set; }
        public int BatchBoardID { get; set; }
        public string BatchNumber { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string Inspector { get; set; } = string.Empty;
        public string AQLLevel { get; set; } = string.Empty;
        public string InspectionLevel { get; set; } = string.Empty;
        public int SampleSize { get; set; }
        public int DefectsFound { get; set; }
        public int AcceptThreshold { get; set; }
        public int RejectThreshold { get; set; }
        public string Result { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime InspectionDate { get; set; }
        public List<InspectionChecklistResultDetailDto> ChecklistResults { get; set; } = new();
        public List<InspectionDefectDetailDto> Defects { get; set; } = new();
        public List<InspectionAttachmentDetailDto> Attachments { get; set; } = new();
    }

    public class InspectionChecklistResultDetailDto
    {
        public int ChecklistResultID { get; set; }
        public int ChecklistTemplateID { get; set; }
        public string ChecklistCode { get; set; } = string.Empty;
        public string ChecklistName { get; set; } = string.Empty;
        public string ChecklistStatus { get; set; } = string.Empty;
        public string? Remarks { get; set; }
    }

    public class InspectionDefectDetailDto
    {
        public int InspectionDefectID { get; set; }
        public string DefectType { get; set; } = string.Empty;
        public string DefectCategory { get; set; } = string.Empty;
        public string DefectDescription { get; set; } = string.Empty;
        public int AffectedQuantity { get; set; }
        public int? SeverityScore { get; set; }
        public string? Remarks { get; set; }
    }

    public class InspectionAttachmentDetailDto
    {
        public int InspectionAttachmentID { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string? Remarks { get; set; }
    }

    public class CreateCapaRequestDto
    {
        [Range(1, int.MaxValue)]
        public int InspectionID { get; set; }

        [Required, StringLength(150)]
        public string IssueTitle { get; set; } = string.Empty;

        [StringLength(255)]
        public string? RootCause { get; set; }

        [StringLength(255)]
        public string? CorrectiveAction { get; set; }

        [StringLength(255)]
        public string? PreventiveAction { get; set; }

        [StringLength(100)]
        public string? ResponsibleDepartment { get; set; }

        public int? ResponsibleUserID { get; set; }
        public DateTime? DueDate { get; set; }

        [StringLength(30)]
        public string Status { get; set; } = "Open";
    }

    public class CapaDto
    {
        public int CAPAID { get; set; }
        public int InspectionID { get; set; }
        public string IssueTitle { get; set; } = string.Empty;
        public string? RootCause { get; set; }
        public string? CorrectiveAction { get; set; }
        public string? PreventiveAction { get; set; }
        public string? ResponsibleDepartment { get; set; }
        public int? ResponsibleUserID { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class InspectionDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Batch board ID must be greater than 0.")]
        public int BatchBoardID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "User ID must be greater than 0.")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "AQL level is required.")]
        [StringLength(40, ErrorMessage = "AQL level must be at most 40 characters.")]
        public string AQLLevel { get; set; } = string.Empty;

        [Required(ErrorMessage = "Inspection level is required.")]
        [StringLength(40, ErrorMessage = "Inspection level must be at most 40 characters.")]
        public string InspectionLevel { get; set; } = string.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "Sample size must be 0 or greater.")]
        public int SampleSize { get; set; }

        [Required(ErrorMessage = "Inspection result is required.")]
        [StringLength(40, ErrorMessage = "Result must be at most 40 characters.")]
        public string Result { get; set; } = string.Empty;

        public string? Notes { get; set; }
    }

    public class InspectionPriorityQueueItemDto
    {
        public int BatchBoardID { get; set; }
        public string BatchCode { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string ProductionRun { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Qty { get; set; }
        public string Status { get; set; } = string.Empty;
        public string BatchStatus { get; set; } = string.Empty;
        public int SubmittedByUserID { get; set; }
        public string SubmittedByName { get; set; } = string.Empty;
        public string SubmittedAt { get; set; } = string.Empty;
    }

    public class StartInspectionRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Batch board ID must be greater than 0.")]
        public int BatchBoardID { get; set; }
    }

    public class InProgressInspectionDto
    {
        public int InspectionID { get; set; }
        public int BatchBoardID { get; set; }
        public string BatchCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string ProductionRun { get; set; } = string.Empty;
        public string BranchWarehouse { get; set; } = string.Empty;
        public string DateSubmitted { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public int Qty { get; set; }
        public string InspectionLevel { get; set; } = string.Empty;
        public string AQLLevel { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public int StartedByUserID { get; set; }
        public string BatchStatus { get; set; } = string.Empty;
        public string StartedAt { get; set; } = string.Empty;
    }

    public class InspectionChecklistEntryDto
    {
        [Required]
        public string Item { get; set; } = string.Empty;
        public bool Approved { get; set; }
    }

    public class FinalizeInspectionRequestDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "Batch board ID must be greater than 0.")]
        public int BatchBoardID { get; set; }

        [Required]
        [StringLength(40)]
        public string AQLLevel { get; set; } = string.Empty;

        [Required]
        [StringLength(40)]
        public string InspectionLevel { get; set; } = string.Empty;

        [Range(0, int.MaxValue)]
        public int SampleSize { get; set; }

        [Range(0, int.MaxValue)]
        public int DefectsFound { get; set; }

        [Range(0, int.MaxValue)]
        public int AcceptThreshold { get; set; }

        [Range(0, int.MaxValue)]
        public int RejectThreshold { get; set; }

        [StringLength(40)]
        public string? QaDecision { get; set; }

        [StringLength(500)]
        public string? CriticalDefectReason { get; set; }

        [StringLength(500)]
        public string? MajorDefectReason { get; set; }

        [StringLength(500)]
        public string? MinorDefectReason { get; set; }

        public string? DefectEntries { get; set; }
        public string? Notes { get; set; }
        public List<InspectionChecklistEntryDto> Checklist { get; set; } = new();
        public List<SaveInspectionDefectDto> Defects { get; set; } = new();
        public List<SaveInspectionAttachmentDto> Attachments { get; set; } = new();
        public bool AutoCreateCapaDraft { get; set; } = true;
    }

    public class InspectionHistoryItemDto
    {
        public int InspectionID { get; set; }
        public int BatchBoardID { get; set; }
        public string BatchCode { get; set; } = string.Empty;
        public string VersionNumber { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string CollectionName { get; set; } = string.Empty;
        public string InspectorName { get; set; } = string.Empty;
        public int UserID { get; set; }
        public string AQLLevel { get; set; } = string.Empty;
        public string InspectionLevel { get; set; } = string.Empty;
        public int SampleSize { get; set; }
        public int DefectsFound { get; set; }
        public int AcceptThreshold { get; set; }
        public int RejectThreshold { get; set; }
        public string Result { get; set; } = string.Empty;
        public string QaDecision { get; set; } = string.Empty;
        public string? DefectEntries { get; set; }
        public string? Notes { get; set; }
        public DateTime InspectionDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
