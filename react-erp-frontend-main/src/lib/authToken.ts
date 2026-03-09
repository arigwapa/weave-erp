import { getToken, clearToken } from "./tokenStorage";

export type AppRole =
  | "Superadmin"
  | "Product Manager"
  | "Admin"
  | "Production Manager"
  | "PQA"
  | "Branch Manager";

function normalizeRole(raw?: string | null): AppRole | null {
  if (!raw) return null;
  const compact = raw.trim().replace(/[-\s]/g, "_").toUpperCase();

  switch (compact) {
    case "SUPERADMIN":
    case "SUPER_ADMIN":
      return "Superadmin";
    case "PRODUCT_MANAGER":
    case "PLM_MANAGER":
    case "PLMMANAGER":
      return "Product Manager";
    case "FINANCE_MANAGER":
    case "FINANCEMANAGER":
      return "Product Manager";
    case "ADMIN":
    case "BRANCH_ADMIN":
    case "BRANCHADMIN":
      return "Admin";
    case "PRODUCTION_MANAGER":
    case "PRODUCTIONMANAGER":
      return "Production Manager";
    case "PQA":
    case "QA_MANAGER":
    case "QAMANAGER":
      return "PQA";
    case "BRANCH_MANAGER":
    case "BRANCHMANAGER":
    case "BRANCH_USER":
      return "Branch Manager";
    default:
      return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRoleFromToken(): AppRole | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const rawRole =
    (payload.role as string | undefined) ??
    (payload.Role as string | undefined) ??
    (payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string | undefined);

  return normalizeRole(rawRole);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const exp = Number(payload.exp);
  if (!Number.isFinite(exp)) return true;
  return exp * 1000 > Date.now();
}

export function logoutAndClearToken(): void {
  clearToken();
}
