// rolesPermissionsApi.ts - roles, permission matrices, and change requests (/api/roles-permissions)
import { apiGet, apiPost, apiPut } from "../http";

export interface RoleDto {
  RoleId: string;
  DisplayName: string;
  Scope: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
}

export interface RoleMatrixResponse {
  roleId: string;
  permissions: Record<string, Record<string, boolean>>;
}

export interface UserCountResponse {
  roleId: string;
  count: number;
}

export interface ChangeRequestPayload {
  RoleId: string;
  BranchId?: number;
  Notes?: string;
  ProposedPermissions?: Record<string, Record<string, boolean>>;
}

export interface ChangeRequestItem {
  RequestId: number;
  RoleId: string;
  RoleDisplayName: string;
  BranchId: number;
  RequestedByUserId: number;
  RequestedByName: string;
  RequestedAt: string;
  Status: string;
  ReviewedByUserId: number | null;
  ReviewedByName: string | null;
  ReviewedAt: string | null;
  Notes: string | null;
  PayloadJson: string;
}

export const rolesPermissionsApi = {
  listRoles: () => apiGet<RoleDto[]>("/api/roles-permissions/roles"),

  getRoleMatrix: (roleId: string) =>
    apiGet<RoleMatrixResponse>(`/api/roles-permissions/roles/${roleId}/matrix`),

  getRoleUserCount: (roleId: string, branchId?: number) =>
    apiGet<UserCountResponse>(
      `/api/roles-permissions/roles/${roleId}/user-count${branchId != null ? `?branchId=${branchId}` : ""}`
    ),

  // change request workflow - BranchAdmins propose, SuperAdmins approve/reject
  createChangeRequest: (payload: ChangeRequestPayload) =>
    apiPost<{ RequestId: number; Status: string }>("/api/roles-permissions/change-requests", payload),

  listChangeRequests: (status?: string) =>
    apiGet<ChangeRequestItem[]>(`/api/roles-permissions/change-requests${status ? `?status=${status}` : ""}`),

  approveRequest: (id: number) =>
    apiPost<{ message: string }>(`/api/roles-permissions/change-requests/${id}/approve`, {}),

  rejectRequest: (id: number) =>
    apiPost<{ message: string }>(`/api/roles-permissions/change-requests/${id}/reject`, {}),

  // SuperAdmin can directly update permissions without the approval flow
  updateRoleMatrix: (roleId: string, matrix: Record<string, Record<string, boolean>>) =>
    apiPut<{ message: string }>(`/api/roles-permissions/roles/${roleId}/matrix`, matrix),
};
