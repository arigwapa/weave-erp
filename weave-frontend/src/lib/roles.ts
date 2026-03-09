export function normalizeRole(role?: string | null): string {
  if (!role) return "";
  const compact = role.trim().replace(/[-\s]/g, "_").toUpperCase();

  switch (compact) {
    case "SUPERADMIN":
      return "SUPER_ADMIN";
    case "BRANCHADMIN":
      return "BRANCH_ADMIN";
    case "PLMMANAGER":
      return "PLM_MANAGER";
    case "PRODUCTIONMANAGER":
      return "PRODUCTION_MANAGER";
    case "WAREHOUSEMANAGER":
      return "WAREHOUSE_MANAGER";
    case "FINANCEMANAGER":
      return "FINANCE_MANAGER";
    case "QAMANAGER":
      return "QA_MANAGER";
    case "BRANCHUSER":
    case "BRANCH_REQUEST_USER":
    case "BRANCHREQUESTUSER":
    case "BRANCHMANAGER":
    case "BRANCHSTAFF":
      return "BRANCH_USER";
    default:
      return compact;
  }
}

export function roleMatches(role: string | null | undefined, allowed: string[]): boolean {
  const normalizedRole = normalizeRole(role);
  return allowed.map((entry) => normalizeRole(entry)).includes(normalizedRole);
}
