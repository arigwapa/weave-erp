// binLocationApi.ts - warehouse storage bins (/api/binlocation)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface BinLocation {
  BinID: number;
  BranchID: number;
  BinCode: string;
  Capacity: number;
  Type: string;
}

export interface CreateBinLocationDto {
  BranchID: number;
  BinCode: string;
  Capacity: number;
  Type: string;
}

export interface UpdateBinLocationDto {
  BinCode: string;
  Capacity: number;
  Type: string;
}

export const binLocationApi = {
  list: () => apiGet<BinLocation[]>("/api/binlocation"),
  get: (id: number) => apiGet<BinLocation>(`/api/binlocation/${id}`),
  create: (dto: CreateBinLocationDto) => apiPost<BinLocation>("/api/binlocation", dto),
  update: (id: number, dto: UpdateBinLocationDto) => apiPut<BinLocation>(`/api/binlocation/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/binlocation/${id}`),
};
