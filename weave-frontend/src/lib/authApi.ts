// authApi.ts - login and "who am I" calls.
import { apiGet, apiPost } from "./http";

export interface LoginResponse {
  AccessToken: string;
  UserID: number;
  BranchID: number;
  RoleName: string;
  Username: string;
  Fullname: string;
  MustChangePassword?: boolean;
}

export interface MeResponse {
  UserID: number;
  BranchID: number;
  BranchName: string;
  RoleName: string;
  Username: string;
  Fullname: string;
  IsActive: boolean;
  Status: string;
  MustChangePassword: boolean;
}

// POST /api/auth/login
export function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return apiPost<any>("/api/auth/login", { username, password }).then((res) => ({
    AccessToken: res.AccessToken ?? res.accessToken ?? "",
    UserID: Number(res.UserID ?? res.userID ?? 0),
    BranchID: Number(res.BranchID ?? res.branchID ?? 0),
    RoleName: res.RoleName ?? res.roleName ?? "",
    Username: res.Username ?? res.username ?? "",
    Fullname: res.Fullname ?? res.fullname ?? "",
    MustChangePassword: Boolean(
      res.MustChangePassword ?? res.mustChangePassword ?? false,
    ),
  }));
}

// GET /api/auth/me
export function me(): Promise<MeResponse> {
  return apiGet<any>("/api/auth/me").then((res) => ({
    UserID: Number(res.UserID ?? res.userID ?? 0),
    BranchID: Number(res.BranchID ?? res.branchID ?? 0),
    BranchName: res.BranchName ?? res.branchName ?? "",
    RoleName: res.RoleName ?? res.roleName ?? "",
    Username: res.Username ?? res.username ?? "",
    Fullname: res.Fullname ?? res.fullname ?? "",
    IsActive: Boolean(res.IsActive ?? res.isActive ?? false),
    Status: res.Status ?? res.status ?? "Active",
    MustChangePassword: Boolean(
      res.MustChangePassword ?? res.mustChangePassword ?? false,
    ),
  }));
}

// POST /api/auth/change-password
export function changePassword(currentPassword: string, newPassword: string) {
  return apiPost<{ message: string }>("/api/auth/change-password", {
    CurrentPassword: currentPassword,
    NewPassword: newPassword,
  });
}
