import { apiGet, apiPut } from "../http";

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

export const adminApprovalInboxApi = {
  listFinance: () => apiGet<AdminApprovalFinanceItem[]>("/api/admin/approval-inbox/finance"),
  submitFinanceDecision: (collectionId: number, dto: AdminFinanceDecisionDto) =>
    apiPut<AdminApprovalFinanceItem>(`/api/admin/approval-inbox/finance/${collectionId}/decision`, dto),
};
