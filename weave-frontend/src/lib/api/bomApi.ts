// bomApi.ts - bill of materials for each product (/api/billofmaterials)
// defines what materials go into making a garment
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface BomLine {
  BOMID: number;
  ProductID: number;
  MaterialName: string;
  QtyRequired: number;
  Unit: string;
  UnitCost: number;
}

export interface CreateBomDto {
  ProductID: number;
  MaterialName: string;
  QtyRequired: number;
  Unit: string;
  UnitCost: number;
}

export interface UpdateBomDto {
  QtyRequired: number;
  Unit: string;
  UnitCost: number;
}

export const bomApi = {
  list: () => apiGet<BomLine[]>("/api/billofmaterials"),
  get: (id: number) => apiGet<BomLine>(`/api/billofmaterials/${id}`),
  create: (dto: CreateBomDto) => apiPost<BomLine>("/api/billofmaterials", dto),
  update: (id: number, dto: UpdateBomDto) => apiPut<BomLine>(`/api/billofmaterials/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/billofmaterials/${id}`),
};
