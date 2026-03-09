import { apiGet, apiPost, apiPut } from "../http";

export interface AdminApprovalBomLine {
  BOMID: number;
  MaterialName: string;
  QtyRequired: number;
  Unit: string;
  UnitCost: number;
}

export interface AdminApprovalProduct {
  ProductID: number;
  SKU: string;
  Name: string;
  SizeProfile: string;
  ApprovalStatus: string;
  TotalCost: number;
  BomLines: AdminApprovalBomLine[];
}

export interface AdminApprovalFinanceItem {
  CollectionID: number;
  PackageID: string;
  CollectionCode: string;
  CollectionName: string;
  Season: string;
  SubmittedAt: string;
  SubmittedBy: string;
  Status: string;
  TotalBomCost: number;
  RecommendedBudget: number;
  ContingencyPercent: number;
  FinanceNotes: string;
  AdminDecision: string;
  AdminDecisionReason: string;
  SentToProductManager: boolean;
  SentToProductionManager: boolean;
  Products: AdminApprovalProduct[];
}

export interface AdminFinanceDecisionDto {
  Decision: "approve" | "reject" | "revision";
  Reason?: string;
}

export interface AdminApprovalQaItem {
  InspectionID: number;
  BatchBoardID: number;
  BatchNumber: string;
  UserID: number;
  ProductVersion: string;
  ProductName: string;
  Result: string;
  Status: string;
  InspectionDate: string;
  SenderName: string;
  AQLLevel: string;
  InspectionLevel: string;
  SampleSize: number;
  DefectsFound: number;
  AcceptThreshold: number;
  RejectThreshold: number;
  Notes: string;
}

export interface AdminQaSendToInventoryDto {
  BinID?: number;
  BinCode?: string;
}

export const adminApprovalInboxApi = {
  listFinance: () => apiGet<AdminApprovalFinanceItem[]>("/api/admin/approval-inbox/finance"),
  listQa: () => apiGet<AdminApprovalQaItem[]>("/api/admin/approval-inbox/qa"),
  listQaForProductionReview: () => apiGet<AdminApprovalQaItem[]>("/api/admin/approval-inbox/qa/production-review"),
  submitQaToProduction: (inspectionId: number) =>
    apiPost<AdminApprovalQaItem>(`/api/admin/approval-inbox/qa/${inspectionId}/submit-production`, {}),
  sendQaToInventory: (inspectionId: number, dto: AdminQaSendToInventoryDto = {}) =>
    apiPost<AdminApprovalQaItem>(`/api/admin/approval-inbox/qa/${inspectionId}/send-inventory`, dto),
  sendQaToProductionQueue: (inspectionId: number) =>
    apiPost<AdminApprovalQaItem>(`/api/admin/approval-inbox/qa/${inspectionId}/send-production-queue`, {}),
  submitFinanceDecision: (collectionId: number, dto: AdminFinanceDecisionDto) =>
    apiPut<AdminApprovalFinanceItem>(`/api/admin/approval-inbox/finance/${collectionId}/decision`, dto),
};
