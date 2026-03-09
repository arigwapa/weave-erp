import { apiGet, apiPost } from "../http";

export interface QaBatchItem {
  BatchBoardID: number;
  BatchNumber: string;
  VersionNumber: string;
  ProductName: string;
  CollectionName: string;
  QuantityProduced: number;
  DateSubmitted: string;
  Status: string;
  Inspector?: string;
  StartedAt?: string;
  InspectionDate?: string;
  SampleSize?: number;
  DefectsFound?: number;
  Result?: "Accepted" | "Rejected" | "Review Required" | string;
}

export interface ChecklistTemplateItem {
  ChecklistTemplateID: number;
  ChecklistCode: string;
  ChecklistName: string;
  Category: string;
  SequenceNo: number;
  IsRequired: boolean;
}

export interface SaveInspectionChecklistResultDto {
  ChecklistTemplateID: number;
  ChecklistStatus: "Pass" | "Fail" | "N/A";
  Remarks?: string;
}

export interface SaveInspectionDefectDto {
  DefectType: "Critical" | "Major" | "Minor";
  DefectCategory: string;
  DefectDescription: string;
  AffectedQuantity: number;
  SeverityScore?: number;
  Remarks?: string;
}

export interface SaveInspectionAttachmentDto {
  FileName: string;
  FileUrl: string;
  FileType: string;
  Remarks?: string;
}

export interface SaveInspectionDto {
  BatchBoardID: number;
  AQLLevel: string;
  InspectionLevel: string;
  SampleSize: number;
  AcceptThreshold: number;
  RejectThreshold: number;
  InspectionDate?: string;
  Notes?: string;
  AutoCreateCapaDraft?: boolean;
  ChecklistResults: SaveInspectionChecklistResultDto[];
  Defects: SaveInspectionDefectDto[];
  Attachments: SaveInspectionAttachmentDto[];
}

export interface SaveInspectionResponseDto {
  InspectionID: number;
  BatchBoardID: number;
  DefectsFound: number;
  Result: "Accepted" | "Rejected" | "Review Required" | string;
  DbResult: string;
  CapaDraftCreated: boolean;
  CapaID?: number | null;
}

export interface InspectionDetail {
  InspectionID: number;
  BatchBoardID: number;
  BatchNumber: string;
  ProductName: string;
  VersionNumber: string;
  CollectionName: string;
  Inspector: string;
  AQLLevel: string;
  InspectionLevel: string;
  SampleSize: number;
  DefectsFound: number;
  AcceptThreshold: number;
  RejectThreshold: number;
  Result: string;
  Notes: string;
  InspectionDate: string;
  ChecklistResults: Array<{
    ChecklistResultID: number;
    ChecklistTemplateID: number;
    ChecklistCode: string;
    ChecklistName: string;
    ChecklistStatus: string;
    Remarks?: string;
  }>;
  Defects: Array<{
    InspectionDefectID: number;
    DefectType: string;
    DefectCategory: string;
    DefectDescription: string;
    AffectedQuantity: number;
    SeverityScore?: number;
    Remarks?: string;
  }>;
  Attachments: Array<{
    InspectionAttachmentID: number;
    FileName: string;
    FileUrl: string;
    FileType: string;
    Remarks?: string;
  }>;
}

export interface InspectionHistoryItem {
  InspectionID: number;
  BatchBoardID: number;
  BatchCode: string;
  VersionNumber: string;
  ProductName: string;
  CollectionName: string;
  InspectorName: string;
  UserID: number;
  AQLLevel: string;
  InspectionLevel: string;
  SampleSize: number;
  DefectsFound: number;
  AcceptThreshold: number;
  RejectThreshold: number;
  Result: "Accepted" | "Rejected" | "Review Required" | string;
  QaDecision: string;
  DefectEntries?: string | null;
  Notes?: string | null;
  InspectionDate: string;
  CreatedAt: string;
  UpdatedAt?: string | null;
  Status: string;
}

export const inspectionApi = {
  getPending: () => apiGet<QaBatchItem[]>("/api/qa/pending"),
  getOngoing: () => apiGet<QaBatchItem[]>("/api/qa/ongoing"),
  getCompleted: () => apiGet<QaBatchItem[]>("/api/qa/completed"),
  startInspection: (batchId: number) =>
    apiPost<QaBatchItem>(`/api/qa/start-inspection/${batchId}`, {}),
  getChecklistTemplate: () =>
    apiGet<ChecklistTemplateItem[]>("/api/inspection/checklist-template"),
  saveInspection: (dto: SaveInspectionDto) =>
    apiPost<SaveInspectionResponseDto>("/api/inspection/save", dto),
  finalizeInspection: (dto: SaveInspectionDto) =>
    apiPost<SaveInspectionResponseDto>("/api/inspection/finish", dto),
  getInspectionDetails: (inspectionId: number) =>
    apiGet<InspectionDetail>(`/api/inspection/${inspectionId}/details`),
  listHistory: () => apiGet<InspectionHistoryItem[]>("/api/inspection/history"),
};
