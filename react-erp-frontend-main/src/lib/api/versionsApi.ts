// versionsApi.ts - product version tracking (/api/productsversion)
// each product can have multiple versions (design iterations)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface ProductVersion {
  VersionID: number;
  ProductID: number;
  VersionNumber: string;
  ApprovalStatus: string;
  BOMComplete: boolean;
  StandardLaborCost?: number;
  StandardOverheadCost?: number;
  ReleasedBudgetID?: number | null;
  ReleasedAt?: string | null;
}

export interface CreateVersionDto {
  ProductID: number;
  VersionNumber: string;
  ApprovalStatus: string;
  BOMComplete: boolean;
  StandardLaborCost?: number;
  StandardOverheadCost?: number;
}

export interface UpdateVersionDto {
  VersionNumber?: string;
  ApprovalStatus?: string;
  BOMComplete?: boolean;
  StandardLaborCost?: number;
  StandardOverheadCost?: number;
}

export interface ReleaseVersionDto {
  BudgetID: number;
  PlannedQty?: number;
  StartDate?: string;
  Notes?: string;
}

export interface SubmitVersionApprovalDto {
  Notes?: string;
}

export interface ApproveVersionForReleaseDto {
  ReleaseScope: "ALL" | "REGION";
  RegionID?: number;
}

export interface PendingProductApprovalItem {
  VersionID: number;
  ProductID: number;
  ProductName: string;
  ProductSKU: string;
  VersionNumber: string;
  ApprovalStatus: string;
  BOMComplete: boolean;
  StandardLaborCost: number;
  StandardOverheadCost: number;
  CreatedDate: string;
}

export const versionsApi = {
  list: () => apiGet<ProductVersion[]>("/api/productsversion"),
  get: (id: number) => apiGet<ProductVersion>(`/api/productsversion/${id}`),
  listByProduct: (productId: number) => apiGet<ProductVersion[]>(`/api/productsversion/by-product/${productId}`),
  create: (dto: CreateVersionDto) => apiPost<ProductVersion>("/api/productsversion", dto),
  update: (id: number, dto: UpdateVersionDto) => apiPut<ProductVersion>(`/api/productsversion/${id}`, dto),
  release: (id: number, dto: ReleaseVersionDto) => apiPost<ProductVersion>(`/api/productsversion/${id}/release`, dto),
  submitForApproval: (id: number, dto: SubmitVersionApprovalDto = {}) =>
    apiPost<ProductVersion>(`/api/productsversion/${id}/submit-for-approval`, dto),
  listPendingApprovals: () =>
    apiGet<PendingProductApprovalItem[]>("/api/productsversion/pending-approvals"),
  approveForRelease: (id: number, dto: ApproveVersionForReleaseDto) =>
    apiPost<ProductVersion>(`/api/productsversion/${id}/approve-for-release`, dto),
  remove: (id: number) => apiDelete(`/api/productsversion/${id}`),
};
