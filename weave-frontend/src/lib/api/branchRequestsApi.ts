import { apiGet, apiPost } from "../http";

export interface BranchPortalProductItem {
  ProductVersionID: number;
  ProductName: string;
  Version: string;
  RegionalAvailableQty: number;
  BranchStockQty: number;
}

export interface BranchPortalRequestItem {
  RequestID: number;
  Status: string;
  RequestedAt: string;
  Items: {
    RequestItemID: number;
    VersionID: number;
    ProductName: string;
    VersionNumber: string;
    QtyRequested: number;
  }[];
}

export const branchRequestsApi = {
  products: () => apiGet<BranchPortalProductItem[]>("/api/branch-requests/products"),
  create: (dto: {
    branchId: number;
    notes?: string;
    items: { versionId: number; qtyRequested: number }[];
  }) =>
    apiPost<BranchPortalRequestItem>("/api/branch-requests/portal", dto),
  my: () => apiGet<BranchPortalRequestItem[]>("/api/branch-requests/my"),
  list: (status?: string) =>
    apiGet<any[]>(
      `/api/branch-requests${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    ),
  getById: (id: number) => apiGet<any>(`/api/branch-requests/${id}`),
  approve: (id: number, notes?: string) =>
    apiPost(`/api/branch-requests/${id}/approve`, { Notes: notes }),
  reject: (id: number, notes?: string) =>
    apiPost(`/api/branch-requests/${id}/reject`, { Notes: notes }),
};
