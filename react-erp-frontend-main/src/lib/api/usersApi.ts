// usersApi.ts - CRUD for user accounts (/api/users)
import { apiGet, apiPost, apiPut } from "../http";

export interface User {
  UserID: number;
  BranchID: number;
  BranchName?: string;
  RoleName: string;
  WarehouseID?: number;
  WarehouseName?: string;
  Username: string;
  Fullname: string;
  Email?: string;
  Mobile?: string;
  Status?: string;
  IsActive?: boolean;
  CreatedByUserID?: number;
  CreatedBy?: string;
  CreatedAt?: string;
}

export interface CreateUserDto {
  BranchID?: number;
  WarehouseID?: number;
  WarehouseName?: string;
  RoleName: string;
  Fullname: string;
  Username: string;
  Email?: string;
  Mobile?: string;
  Password: string;
}

export interface UpdateUserDto {
  BranchID?: number;
  WarehouseID?: number;
  WarehouseName?: string;
  Fullname?: string;
  RoleName?: string;
  Username?: string;
  Email?: string;
  Mobile?: string;
  Password?: string;
  IsActive?: boolean;
}

function normalizeUser(raw: any): User {
  const first = raw.Firstname ?? raw.firstname ?? "";
  const last = raw.Lastname ?? raw.lastname ?? "";
  const fullFromNames = `${first} ${last}`.trim();

  return {
    UserID: Number(raw.UserID ?? raw.userID ?? 0),
    BranchID: Number(raw.BranchID ?? raw.branchID ?? 0),
    BranchName: raw.BranchName ?? raw.branchName,
    RoleName: raw.RoleName ?? raw.roleName ?? (raw.RoleID ? `Role ${raw.RoleID}` : ""),
    WarehouseID: raw.WarehouseID ?? raw.warehouseID,
    WarehouseName: raw.WarehouseName ?? raw.warehouseName,
    Username: raw.Username ?? raw.username ?? "",
    Fullname: raw.Fullname ?? raw.fullname ?? fullFromNames,
    Email: raw.Email ?? raw.email,
    Mobile: raw.Mobile ?? raw.mobile,
    Status: raw.Status ?? raw.status,
    IsActive: Boolean(raw.IsActive ?? raw.isActive ?? false),
    CreatedByUserID: raw.CreatedByUserID ?? raw.createdByUserID,
    CreatedBy: raw.CreatedBy ?? raw.createdBy ?? raw.CreatedByName ?? raw.createdByName,
    CreatedAt: raw.CreatedAt ?? raw.createdAt,
  };
}

export const usersApi = {
  list: () => apiGet<any[]>("/api/users").then((items) => items.map(normalizeUser)),
  listArchived: () =>
    apiGet<any[]>("/api/users/archived").then((items) => items.map(normalizeUser)),
  create: (dto: CreateUserDto) => apiPost<User>("/api/users/manage", dto),
  update: (id: number, dto: UpdateUserDto) =>
    apiPut<User>(`/api/users/${id}/manage`, dto),
  archive: (id: number) => apiPut<void>(`/api/users/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/users/${id}/restore`, {}),
};
