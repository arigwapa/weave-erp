// productionInventoryApi.ts - finished goods in the warehouse (/api/productioninventory)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface ProductionInventory {
  ProdInvID: number;
  BinID: number;
  VersionID: number;
  QuantityOnHand: number;
  Status: string;
}

export interface CreateProductionInventoryDto {
  BinID: number;
  VersionID: number;
  QuantityOnHand: number;
  Status: string;
}

export interface UpdateProductionInventoryDto {
  QuantityOnHand: number;
  Status: string;
}

interface ReceiveProductDto {
  VersionID: number;
  BinID: number;
  Qty: number;
  BatchID?: number;
}

interface IssueProductDto {
  VersionID: number;
  BinID: number;
  Qty: number;
}

export const productionInventoryApi = {
  list: () => apiGet<ProductionInventory[]>("/api/productioninventory"),
  listArchived: () => apiGet<ProductionInventory[]>("/api/productioninventory/archived"),
  get: (id: number) => apiGet<ProductionInventory>(`/api/productioninventory/${id}`),
  create: (dto: CreateProductionInventoryDto) => apiPost<ProductionInventory>("/api/productioninventory", dto),
  update: (id: number, dto: UpdateProductionInventoryDto) => apiPut<ProductionInventory>(`/api/productioninventory/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/productioninventory/${id}`),
  archive: (id: number) => apiPut<void>(`/api/productioninventory/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/productioninventory/${id}/restore`, {}),

  // workflow via /api/workflow/warehouse/products
  receiveProduct: (dto: ReceiveProductDto) => apiPost<void>("/api/workflow/warehouse/products/receive", dto),
  issueProduct: (dto: IssueProductDto) => apiPost<void>("/api/workflow/warehouse/products/issue", dto),
};
