// productionOrderApi.ts - manufacturing orders (/api/productionorder)
// also has workflow actions for starting/completing orders and logging output
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface ProductionOrder {
  OrderID: number;
  BranchID: number;
  VersionID: number;
  PlannedQty: number;
  StartDate: string;
  Status: string;
}

export interface CreateProductionOrderDto {
  BranchID: number;
  VersionID: number;
  PlannedQty: number;
  StartDate: string;
  Status: string;
}

export interface UpdateProductionOrderDto {
  PlannedQty?: number;
  StartDate?: string;
  Status?: string;
}

interface WorkflowLogDto {
  OutputQty: number;
  WasteQty: number;
  LogDate?: string;
}

interface WorkflowBatchDto {
  BatchNumber: string;
  BatchQty: number;
  ProducedDate?: string;
}

export const productionOrderApi = {
  list: () => apiGet<ProductionOrder[]>("/api/productionorder"),
  listArchived: () => apiGet<ProductionOrder[]>("/api/productionorder/archived"),
  get: (id: number) => apiGet<ProductionOrder>(`/api/productionorder/${id}`),
  create: (dto: CreateProductionOrderDto) => apiPost<ProductionOrder>("/api/productionorder", dto),
  update: (id: number, dto: UpdateProductionOrderDto) => apiPut<ProductionOrder>(`/api/productionorder/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/productionorder/${id}`),
  archive: (id: number) => apiPut<void>(`/api/productionorder/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/productionorder/${id}/restore`, {}),

  // workflow actions via /api/workflow/production
  startOrder: (orderId: number) => apiPost<void>(`/api/workflow/production/orders/${orderId}/start`, {}),
  completeOrder: (orderId: number) => apiPost<void>(`/api/workflow/production/orders/${orderId}/complete`, {}),
  addLog: (orderId: number, dto: WorkflowLogDto) => apiPost<void>(`/api/workflow/production/orders/${orderId}/log`, dto),
  createBatch: (orderId: number, dto: WorkflowBatchDto) => apiPost<void>(`/api/workflow/production/orders/${orderId}/batches`, dto),
};
