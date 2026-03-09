import { apiGet, apiPost, apiPut } from "../http";

export interface Region {
  RegionID: number;
  RegionName: string;
  IsActive: boolean;
  CreatedAt?: string;
  CreatedDate?: string;
}

export interface UpsertRegionDto {
  RegionName: string;
  IsActive: boolean;
}

export const regionsApi = {
  list: () => apiGet<Region[]>("/api/regions"),
  create: (dto: UpsertRegionDto) => apiPost<Region>("/api/regions", dto),
  update: (id: number, dto: UpsertRegionDto) => apiPut<Region>(`/api/regions/${id}`, dto),
};
