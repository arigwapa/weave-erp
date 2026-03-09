// defectLogApi.ts - tracks defects found during QA inspections (/api/defectlog)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface DefectLog {
  DefectID: number;
  InspectionID: number;
  DefectType: string;
  Severity: string;
  Status: string;
  Notes: string | null;
}

export interface CreateDefectLogDto {
  InspectionID: number;
  DefectType: string;
  Severity: string;
  Status: string;
  Notes?: string;
}

export interface UpdateDefectLogDto {
  DefectType: string;
  Severity: string;
  Status: string;
  Notes?: string;
}

export const defectLogApi = {
  list: () => apiGet<DefectLog[]>("/api/defectlog"),
  listArchived: () => apiGet<DefectLog[]>("/api/defectlog/archived"),
  get: (id: number) => apiGet<DefectLog>(`/api/defectlog/${id}`),
  create: (dto: CreateDefectLogDto) => apiPost<DefectLog>("/api/defectlog", dto),
  update: (id: number, dto: UpdateDefectLogDto) => apiPut<DefectLog>(`/api/defectlog/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/defectlog/${id}`),
  archive: (id: number) => apiPut<void>(`/api/defectlog/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/defectlog/${id}/restore`, {}),
};
