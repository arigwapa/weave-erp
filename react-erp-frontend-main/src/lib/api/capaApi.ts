// capaApi.ts - corrective/preventive actions linked to defects (/api/capa)
import { apiGet, apiPost } from "../http";

export interface Capa {
  CAPAID: number;
  InspectionID: number;
  IssueTitle: string;
  RootCause: string;
  CorrectiveAction: string;
  PreventiveAction: string;
  ResponsibleDepartment: string;
  ResponsibleUserID?: number | null;
  DueDate?: string | null;
  Status: string;
  CreatedAt: string;
  UpdatedAt?: string | null;
}

export interface CreateCapaDto {
  InspectionID: number;
  IssueTitle: string;
  RootCause: string;
  CorrectiveAction: string;
  PreventiveAction: string;
  ResponsibleDepartment: string;
  ResponsibleUserID?: number | null;
  DueDate?: string | null;
  Status?: "Open" | "In Progress" | "Resolved" | "Closed";
}

export const capaApi = {
  create: (dto: CreateCapaDto) => apiPost<Capa>("/api/capa", dto),
  byInspection: (inspectionId: number) =>
    apiGet<Capa[]>(`/api/capa/by-inspection/${inspectionId}`),
};
