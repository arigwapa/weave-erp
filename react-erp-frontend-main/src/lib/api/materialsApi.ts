import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface Material {
  MaterialID: number;
  Name: string;
  Type: string;
  Unit: string;
  UnitCost: number;
  SupplierName?: string | null;
  Notes?: string | null;
  Status: string;
  CreatedByUserID: number;
  CreatedAt: string;
  UpdatedByUserID?: number | null;
  UpdatedAt?: string | null;
}

export interface CreateMaterialDto {
  Name: string;
  Type: string;
  Unit: string;
  UnitCost: number;
  SupplierName?: string;
  Notes?: string;
  Status: string;
  CreatedByUserID: number;
  CreatedAt: string;
  UpdatedByUserID?: number | null;
  UpdatedAt?: string | null;
}

export interface UpdateMaterialDto {
  MaterialID: number;
  Name: string;
  Type: string;
  Unit: string;
  UnitCost: number;
  SupplierName?: string;
  Notes?: string;
  Status: string;
  CreatedByUserID: number;
  CreatedAt: string;
  UpdatedByUserID?: number | null;
  UpdatedAt?: string | null;
}

export const materialsApi = {
  list: () => apiGet<Material[]>("/api/materials"),
  listArchived: () => apiGet<Material[]>("/api/materials/archived"),
  get: (id: number) => apiGet<Material>(`/api/materials/${id}`),
  create: (dto: CreateMaterialDto) => apiPost<Material>("/api/materials", dto),
  update: (id: number, dto: UpdateMaterialDto) => apiPut<void>(`/api/materials/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/materials/${id}`),
  archive: (id: number) => apiPut<void>(`/api/materials/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/materials/${id}/restore`, {}),
};
