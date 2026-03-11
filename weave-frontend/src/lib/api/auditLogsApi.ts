// auditLogsApi.ts - fetches audit trail records (/api/auditlogs)
// SuperAdmin sees all branches, BranchAdmin only sees their own
import { apiGet } from "../http";

export interface AuditUserDto {
  UserID: number;
  Username: string;
  Fullname: string;
  RoleName: string;
  BranchID: number;
}

export interface AuditLogEntry {
  AuditID: number;
  Module?: string;
  Action: string;
  OldValue?: string;
  NewValue?: string;
  PerformedAt: string;
  IpAddress?: string;
  AffectedUser: AuditUserDto;
  ActorUser: AuditUserDto;
}

export interface AuditLogsResponse {
  Items: AuditLogEntry[];
  TotalCount: number;
  Page: number;
  PageSize: number;
}

export interface SuperAdminFilters {
  from?: string;
  to?: string;
  branchId?: number;
  role?: string;
  action?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface BranchAdminFilters {
  from?: string;
  to?: string;
  action?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

function buildParams(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val !== undefined && val !== null && val !== "") {
      params.set(key, String(val));
    }
  }
  return params.toString();
}

export const auditLogsApi = {
  // GET /api/auditlogs/superadmin - all branches
  getSuperAdminLogs: (filters: SuperAdminFilters) =>
    apiGet<AuditLogsResponse>(`/api/auditlogs/superadmin?${buildParams(filters as unknown as Record<string, unknown>)}`),

  // GET /api/auditlogs/branchadmin - own branch only
  getBranchAdminLogs: (filters: BranchAdminFilters) =>
    apiGet<AuditLogsResponse>(`/api/auditlogs/branchadmin?${buildParams(filters as unknown as Record<string, unknown>)}`),
};
