// branchApi.ts - manage factory/office branches (/api/branch)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface Branch {
  BranchID: number;
  BranchName: string;
  Address: string;
  Capacity: number;
  WarehouseManagerUserID?: number | null;
  IsActive?: boolean;
  CreatedAt?: string;
  CreatedDate?: string;
}

export interface CreateBranchDto {
  BranchName: string;
  Address?: string;
  Capacity: number;
  WarehouseManagerUserID?: number | null;
  IsActive?: boolean;
}

export interface UpdateBranchDto {
  BranchName: string;
  Address?: string;
  Capacity: number;
  WarehouseManagerUserID?: number | null;
  IsActive?: boolean;
}

export const branchApi = {
  list: () => apiGet<Branch[]>("/api/branches"),
  listByWarehouseManager: (userId: number) =>
    apiGet<Branch[]>(`/api/branches/by-warehouse-manager?userId=${userId}`),
  get: (id: number) => apiGet<Branch>(`/api/branches/${id}`),
  create: (dto: CreateBranchDto) => apiPost<Branch>("/api/branches", dto),
  update: (id: number, dto: UpdateBranchDto) => apiPut<Branch>(`/api/branches/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/branches/${id}`),
};
