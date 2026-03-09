import { apiGet, apiPost } from "../http";

export type WeaveCollection = {
  Id: number;
  CollectionName: string;
  ProductName: string;
  SizeVariation: string;
  Status: string;
};

export type WeaveBatch = {
  Id: number;
  BatchCode: string;
  QuantityToBuild: number;
  Status: string;
  ProductName?: string;
  SizeVariation?: string;
  CollectionName?: string;
};

export type WeaveInventory = {
  Id: number;
  ProductName: string;
  SizeVariation: string;
  AvailableQuantity: number;
  UpdatedAt: string;
};

export type WeaveStockRequest = {
  Id: number;
  ProductName: string;
  SizeVariation: string;
  RequestedQuantity: number;
  Status: string;
  Message: string;
  UpdatedAt: string;
};

export const weaveFlowApi = {
  listGateAPending: () => apiGet<WeaveCollection[]>("/api/phase1/pm/drafts"),
  submitGateA: (id: number, reason: string) =>
    apiPost(`/api/weave/gate-a/collections/${id}/submit`, { reason }),

  listGateBPending: () => apiGet<WeaveCollection[]>("/api/weave/gate-b/pending"),
  approveGateB: (id: number, reason: string) =>
    apiPost(`/api/weave/gate-b/collections/${id}/approve`, { reason }),

  listGateCReady: () => apiGet<WeaveCollection[]>("/api/weave/gate-c/ready"),
  completeGateC: (
    id: number,
    payload: { goodQuantity: number; rejectQuantity: number; scrapQuantity: number; reason: string },
  ) => apiPost(`/api/weave/gate-c/collections/${id}/record-output`, payload),

  listGateDPending: () => apiGet<WeaveBatch[]>("/api/weave/gate-d/pending"),
  releaseGateD: (batchId: number, pass: boolean, reason: string) =>
    apiPost(`/api/weave/gate-d/batches/${batchId}/release`, { pass, reason }),

  listReleasedInventory: () => apiGet<WeaveInventory[]>("/api/weave/inventory/released"),

  submitStockRequest: (payload: {
    productName: string;
    sizeVariation: string;
    requestedQuantity: number;
    reason: string;
  }) => apiPost("/api/weave/stock-requests", payload),
  listStockRequests: () => apiGet<WeaveStockRequest[]>("/api/weave/stock-requests"),
  approveStockRequest: (id: number, reason: string) =>
    apiPost(`/api/weave/stock-requests/${id}/approve`, { reason }),
  dispatchStockRequest: (id: number, reason: string) =>
    apiPost(`/api/weave/stock-requests/${id}/dispatch`, { reason }),
  receiveStockRequest: (id: number, reason: string) =>
    apiPost(`/api/weave/stock-requests/${id}/receive`, { reason }),
};
