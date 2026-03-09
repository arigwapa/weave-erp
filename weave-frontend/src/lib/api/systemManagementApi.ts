import { apiGet, apiPost } from "../http";

export interface SystemActivityPoint {
  Date: string;
  Logins: number;
  DatabaseQueries: number;
}

export interface SystemDashboardData {
  TotalActiveUsers: number;
  TotalSystemErrors: number;
  ServerUptime: string;
  SystemActivity: SystemActivityPoint[];
}

export interface ProvisionUserRequest {
  FullName: string;
  EmailAddress: string;
  TemporaryPassword: string;
  Role: string;
  BranchID?: number;
}

export interface ProvisionUserResponse {
  UserID: number;
  Username: string;
  RoleName: string;
}

export interface BranchSummary {
  BranchID: number;
  BranchName: string;
  RegionID: number;
}

export interface CreateBranchRequest {
  BranchName: string;
  RegionID: number;
  Location?: string;
  Address?: string;
}

export const systemManagementApi = {
  dashboard: () => apiGet<SystemDashboardData>("/api/system-management/dashboard"),
  listBranches: () => apiGet<BranchSummary[]>("/api/system-management/branches"),
  createBranch: (payload: CreateBranchRequest) =>
    apiPost<BranchSummary>("/api/system-management/branches", payload),
  createUser: (payload: ProvisionUserRequest) =>
    apiPost<ProvisionUserResponse>("/api/system-management/users", payload),
};
