// binLocationApi.ts - warehouse storage bins (/api/binlocation)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface BinLocation {
  BinID: number;
  BinLocation: string;
  BinCode: string;
  IsBinActive: boolean;
  CreatedAt: string;
  UpdatedAt?: string | null;
  OccupancyStatus: "Available" | "Occupied" | string;
  OccupiedQuantity: number;
  OccupiedVersionID?: number | null;
}

export interface CreateBinLocationDto {
  BinLocation: string;
}

export interface UpdateBinLocationDto {
  BinLocation: string;
}

export const binLocationApi = {
  list: () => apiGet<BinLocation[]>("/api/binlocation"),
  listArchived: () => apiGet<BinLocation[]>("/api/binlocation/archived"),
  create: (dto: CreateBinLocationDto) => apiPost<BinLocation>("/api/binlocation", dto),
  update: (id: number, dto: UpdateBinLocationDto) => apiPut<BinLocation>(`/api/binlocation/${id}`, dto),
  archive: (id: number) => apiPut<void>(`/api/binlocation/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/binlocation/${id}/restore`, {}),
  remove: (id: number) => apiDelete(`/api/binlocation/${id}`),
};
