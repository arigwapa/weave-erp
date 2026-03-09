// costRecordApi.ts - COGS breakdown per order (/api/costrecord)
// computeCost auto-calculates material costs from BOM + production logs
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface CostRecord {
  CostID: number;
  OrderID: number;
  MaterialCost: number;
  LaborCostEstimate: number;
  OverheadCostEstimate: number;
  WasteCost: number;
  TotalCOGS: number;
  Status: string;
}

export interface CreateCostRecordDto {
  OrderID: number;
  MaterialCost: number;
  LaborCostEstimate: number;
  OverheadCostEstimate: number;
  WasteCost: number;
  TotalCOGS: number;
  Status: string;
}

export interface UpdateCostRecordDto {
  MaterialCost: number;
  LaborCostEstimate: number;
  OverheadCostEstimate: number;
  WasteCost: number;
  TotalCOGS: number;
  Status: string;
}

interface ComputeCostDto {
  LaborCostEstimate?: number;
  OverheadCostEstimate?: number;
}

export const costRecordApi = {
  list: () => apiGet<CostRecord[]>("/api/costrecord"),
  listArchived: () => apiGet<CostRecord[]>("/api/costrecord/archived"),
  get: (id: number) => apiGet<CostRecord>(`/api/costrecord/${id}`),
  create: (dto: CreateCostRecordDto) => apiPost<CostRecord>("/api/costrecord", dto),
  update: (id: number, dto: UpdateCostRecordDto) => apiPut<CostRecord>(`/api/costrecord/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/costrecord/${id}`),
  archive: (id: number) => apiPut<void>(`/api/costrecord/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/costrecord/${id}/restore`, {}),

  // POST /api/workflow/finance/orders/:id/compute-cost
  computeCost: (orderId: number, dto?: ComputeCostDto) =>
    apiPost<CostRecord>(`/api/workflow/finance/orders/${orderId}/compute-cost`, dto ?? {}),
};
