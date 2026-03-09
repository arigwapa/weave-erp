// productionBatchApi.ts - groups of finished garments ready for QA (/api/productionbatch)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface ProductionBatch {
  BatchID: number;
  OrderID: number;
  BatchNumber: string;
  BatchQty: number;
  ProducedDate: string | null;
  Status: string;
}

export interface CreateProductionBatchDto {
  OrderID: number;
  BatchNumber: string;
  BatchQty: number;
  Status: string;
}

export interface UpdateProductionBatchDto {
  BatchQty: number;
  ProducedDate?: string;
  Status: string;
}

export const productionBatchApi = {
  list: () => apiGet<ProductionBatch[]>("/api/productionbatch"),
  listArchived: () => apiGet<ProductionBatch[]>("/api/productionbatch/archived"),
  get: (id: number) => apiGet<ProductionBatch>(`/api/productionbatch/${id}`),
  create: (dto: CreateProductionBatchDto) => apiPost<ProductionBatch>("/api/productionbatch", dto),
  update: (id: number, dto: UpdateProductionBatchDto) => apiPut<ProductionBatch>(`/api/productionbatch/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/productionbatch/${id}`),
  archive: (id: number) => apiPut<void>(`/api/productionbatch/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/productionbatch/${id}/restore`, {}),
};
