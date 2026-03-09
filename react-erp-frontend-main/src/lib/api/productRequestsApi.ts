import { apiGet, apiPost } from "../http";

export interface DeliverySchedule {
  DeliveryID: number;
  ScheduleDate: string;
  Status: string;
  TrackingRef?: string | null;
  CreatedAt: string;
}

export interface ProductRequestItem {
  RequestID: number;
  FromBranchID: number;
  FromBranchName: string;
  ToRegionID: number;
  ToRegionName: string;
  VersionID: number;
  RequestedQty: number;
  Status: string;
  RequestedByUserID: number;
  RequestedByUsername: string;
  ApprovedByUserID?: number | null;
  ApprovedAt?: string | null;
  Notes?: string | null;
  RequestedAt: string;
  Delivery?: DeliverySchedule | null;
}

export const productRequestsApi = {
  create: (dto: { VersionID: number; RequestedQty: number; Notes?: string }) =>
    apiPost<ProductRequestItem>("/api/requests", dto),
  myBranch: () => apiGet<ProductRequestItem[]>("/api/requests/my-branch"),
  region: (status?: string) =>
    apiGet<ProductRequestItem[]>(
      `/api/requests/region${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    ),
  approve: (id: number, dto: { Notes?: string }) =>
    apiPost<ProductRequestItem>(`/api/requests/${id}/approve`, dto),
  reject: (id: number, dto: { Notes?: string }) =>
    apiPost<ProductRequestItem>(`/api/requests/${id}/reject`, dto),
  scheduleDelivery: (
    id: number,
    dto: { ScheduleDate: string; TrackingRef?: string; SourceBinID?: number | null },
  ) => apiPost<ProductRequestItem>(`/api/requests/${id}/schedule-delivery`, dto),
  markDelivered: (id: number, dto?: { SourceBinID?: number | null }) =>
    apiPost<ProductRequestItem>(`/api/requests/${id}/mark-delivered`, dto ?? {}),
  setBackorder: (id: number, dto?: { Notes?: string; AutoCreateProductionOrder?: boolean }) =>
    apiPost<ProductRequestItem>(`/api/requests/${id}/set-backorder`, dto ?? {}),
};
