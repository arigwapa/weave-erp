import { apiGet, apiPut } from "../http";

export type FinanceSubmissionStatus = "Pending" | "Submitted" | "Approved" | "Rejected" | "Revision";

export interface FinanceSubmissionCollection {
  CollectionID: number;
  CollectionCode: string;
  CollectionName: string;
  PackageID: string;
  TotalBomCost: number;
  RecommendedBudget: number;
  Notes: string;
  Status: FinanceSubmissionStatus;
  Feedback: string;
  FeedbackDetail: string;
  SentToProductManager: boolean;
  SentToProductionManager: boolean;
}

export interface SubmitFinancePackageDto {
  RecommendedBudget: number;
  Notes?: string;
}

export const financeSubmissionAdminApi = {
  listCollections: () =>
    apiGet<FinanceSubmissionCollection[]>("/api/finance/submission-admin/collections"),
  submitCollection: (collectionId: number, dto: SubmitFinancePackageDto) =>
    apiPut<FinanceSubmissionCollection>(`/api/finance/submission-admin/collections/${collectionId}/submit`, dto),
};
