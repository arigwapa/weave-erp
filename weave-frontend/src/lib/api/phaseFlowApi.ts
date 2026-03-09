import { apiGet, apiPost } from "../http";

export const phaseFlowApi = {
  listMaterials: () => apiGet<any[]>("/api/phase1/materials"),
  createCollection: (payload: {
    collectionName: string;
    productName: string;
    sizeVariation: string;
    bom: { materialId: number; quantityNeeded: number }[];
  }) => apiPost("/api/phase1/collections", payload),
  listPmDrafts: () => apiGet<any[]>("/api/phase1/pm/drafts"),
  submitForCosting: (id: number) => apiPost(`/api/phase1/collections/${id}/submit-for-costing`, {}),

  listFinancePending: () => apiGet<any[]>("/api/phase1/finance/pending"),
  getFinanceDetail: (id: number) => apiGet<any>(`/api/phase1/finance/collections/${id}`),
  requestAdjustments: (id: number, payload: unknown) =>
    apiPost(`/api/phase1/finance/collections/${id}/request-adjustments`, payload),
  submitToAdmin: (id: number, payload: unknown) =>
    apiPost(`/api/phase1/finance/collections/${id}/submit-to-admin`, payload),

  listPendingAdminApprovals: () => apiGet<any[]>("/api/phase2/admin/pending-approvals"),
  adminReject: (id: number, remarks: string) =>
    apiPost(`/api/phase2/admin/collections/${id}/reject`, { remarks }),
  adminApprove: (id: number, remarks?: string) =>
    apiPost(`/api/phase2/admin/collections/${id}/approve`, { remarks }),

  getProductionDashboard: () => apiGet<any>("/api/phase3/production/dashboard"),
  getReadyForManufacturing: () => apiGet<any[]>("/api/phase3/production/ready-collections"),
  getProductionBatches: () => apiGet<any[]>("/api/phase3/production/batches"),
  startProduction: (collectionId: number, payload: { teamWorkCenter: string; quantityToBuild: number }) =>
    apiPost(`/api/phase3/production/collections/${collectionId}/start`, payload),
  sendBatchToPqa: (batchId: number) => apiPost(`/api/phase3/production/batches/${batchId}/send-to-pqa`, {}),

  getPqaDashboard: () => apiGet<any>("/api/phase4/pqa/dashboard"),
  getPqaPendingBatches: () => apiGet<any[]>("/api/phase4/pqa/pending-batches"),
  submitPqaDecision: (
    batchId: number,
    payload: {
      rawMaterialsPassed: boolean;
      productSizeCompatibilityPassed: boolean;
      batchDetailsConsistencyPassed: boolean;
      passBatch: boolean;
      defectCategory?: string;
      defectReason?: string;
    },
  ) => apiPost(`/api/phase4/pqa/batches/${batchId}/decision`, payload),

  getInventoryDashboard: () => apiGet<any>("/api/phase5/inventory/dashboard"),
  getInventoryMaster: () => apiGet<any[]>("/api/phase5/inventory/master"),
  requestRestock: (payload: { productName: string; sizeVariation: string; requestedQuantity: number }) =>
    apiPost("/api/phase5/restock-requests", payload),
};
