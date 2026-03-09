// productionLogApi.ts - daily output/waste tracking per order (/api/productionlog)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface ProductionLog {
  LogID: number;
  OrderID: number;
  OutputQty: number;
  WasteQty: number;
  LogDate: string;
}

export interface CreateProductionLogDto {
  OrderID: number;
  OutputQty: number;
  WasteQty: number;
  LogDate?: string;
}

export interface UpdateProductionLogDto {
  OutputQty: number;
  WasteQty: number;
  LogDate?: string;
}

export const productionLogApi = {
  list: () => apiGet<ProductionLog[]>("/api/productionlog"),
  get: (id: number) => apiGet<ProductionLog>(`/api/productionlog/${id}`),
  create: (dto: CreateProductionLogDto) => apiPost<ProductionLog>("/api/productionlog", dto),
  update: (id: number, dto: UpdateProductionLogDto) => apiPut<ProductionLog>(`/api/productionlog/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/productionlog/${id}`),
};
