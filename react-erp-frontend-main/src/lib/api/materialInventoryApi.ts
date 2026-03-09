// materialInventoryApi.ts - raw material stock levels (/api/materialinventory)
// receive/issue workflows can trigger low-stock alerts via SignalR
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface MaterialInventory {
  MatInvID: number;
  BinID: number;
  MaterialID: number;
  QuantityOnHand: number;
}

export interface CreateMaterialInventoryDto {
  BinID: number;
  MaterialID: number;
  QuantityOnHand: number;
}

export interface UpdateMaterialInventoryDto {
  QuantityOnHand: number;
}

interface ReceiveMaterialDto {
  MaterialID: number;
  BinID: number;
  Qty: number;
}

interface IssueMaterialDto {
  MaterialID: number;
  BinID: number;
  Qty: number;
}

export const materialInventoryApi = {
  list: () => apiGet<MaterialInventory[]>("/api/materialinventory"),
  get: (id: number) => apiGet<MaterialInventory>(`/api/materialinventory/${id}`),
  create: (dto: CreateMaterialInventoryDto) => apiPost<MaterialInventory>("/api/materialinventory", dto),
  update: (id: number, dto: UpdateMaterialInventoryDto) => apiPut<MaterialInventory>(`/api/materialinventory/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/materialinventory/${id}`),

  // workflow via /api/workflow/warehouse/materials
  receiveMaterial: (dto: ReceiveMaterialDto) => apiPost<void>("/api/workflow/warehouse/materials/receive", dto),
  issueMaterial: (dto: IssueMaterialDto) => apiPost<void>("/api/workflow/warehouse/materials/issue", dto),
};
