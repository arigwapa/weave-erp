import { apiGet } from "../http";

export interface Role {
  RoleID: number;
  DisplayName: string;
  Scope: string;
  Description?: string;
  IsActive: boolean;
}

function normalizeRole(raw: any): Role {
  return {
    RoleID: Number(raw.RoleID ?? raw.roleID ?? raw.RoleId ?? raw.roleId ?? 0),
    DisplayName: String(raw.DisplayName ?? raw.displayName ?? "").trim(),
    Scope: String(raw.Scope ?? raw.scope ?? "").trim(),
    Description: raw.Description ?? raw.description,
    IsActive: Boolean(raw.IsActive ?? raw.isActive ?? true),
  };
}

export const rolesApi = {
  list: () => apiGet<any[]>("/api/roles").then((items) => items.map(normalizeRole)),
};
