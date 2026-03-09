import { apiGet, apiPost } from "../http";

export interface PendingBranchRequest {
  RequestID: number;
  BranchID: number;
  BranchName: string;
  RegionID: number;
  RegionName: string;
  Status: string;
  RequestedByUserID: number;
  RequestedBy: string;
  RequestedAt: string;
  Notes?: string;
  Items: {
    RequestItemID: number;
    VersionID: number;
    ProductName: string;
    VersionNumber: string;
    QtyRequested: number;
  }[];
}

export const transfersApi = {
  pending: (regionId?: number) =>
    apiGet<PendingBranchRequest[]>(
      `/api/transfers/pending${regionId ? `?regionId=${regionId}` : ""}`,
    ),
  create: (dto: {
    requestId: number;
    fromBinId: number;
    scheduledDate: string;
    items: { versionId: number; qtyShipped: number }[];
  }) => apiPost("/api/transfers", dto),
  deliver: (transferId: number) => apiPost(`/api/transfers/${transferId}/deliver`, {}),
};
