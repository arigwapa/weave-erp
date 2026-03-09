export const WorkflowRoles = {
  SuperAdmin: "SuperAdmin",
  Admin: "Admin",
  BranchManager: "BranchManager",
  BranchUser: "BranchUser",
  PLMManager: "PLMManager",
  ProductionManager: "ProductionManager",
  QAManager: "QAManager",
  WarehouseManager: "WarehouseManager",
} as const;

export type WorkflowRole = (typeof WorkflowRoles)[keyof typeof WorkflowRoles];

const roleAliasMap: Record<string, WorkflowRole> = {
  SUPERADMIN: WorkflowRoles.SuperAdmin,
  SUPER_ADMIN: WorkflowRoles.SuperAdmin,
  ADMIN: WorkflowRoles.Admin,
  BRANCHADMIN: WorkflowRoles.Admin,
  BRANCH_ADMIN: WorkflowRoles.Admin,
  BRANCHMANAGER: WorkflowRoles.BranchManager,
  BRANCH_MANAGER: WorkflowRoles.BranchManager,
  BRANCH_USER: WorkflowRoles.BranchManager,
  BRANCHUSER: WorkflowRoles.BranchManager,
  PLMMANAGER: WorkflowRoles.PLMManager,
  PLM_MANAGER: WorkflowRoles.PLMManager,
  PRODUCTMANAGER: WorkflowRoles.PLMManager,
  PRODUCT_MANAGER: WorkflowRoles.PLMManager,
  FINANCEMANAGER: WorkflowRoles.PLMManager,
  FINANCE_MANAGER: WorkflowRoles.PLMManager,
  PRODUCTIONMANAGER: WorkflowRoles.ProductionManager,
  PRODUCTION_MANAGER: WorkflowRoles.ProductionManager,
  QAMANAGER: WorkflowRoles.QAManager,
  QA_MANAGER: WorkflowRoles.QAManager,
  PQA: WorkflowRoles.QAManager,
  WAREHOUSEMANAGER: WorkflowRoles.WarehouseManager,
  WAREHOUSE_MANAGER: WorkflowRoles.WarehouseManager,
};

export const WorkflowRoleHomePaths: Record<WorkflowRole, string> = {
  [WorkflowRoles.SuperAdmin]: "/super-admin/dashboard",
  [WorkflowRoles.Admin]: "/admin/dashboard",
  [WorkflowRoles.BranchManager]: "/branch/dashboard",
  [WorkflowRoles.BranchUser]: "/branch/dashboard",
  [WorkflowRoles.PLMManager]: "/plm/dashboard",
  [WorkflowRoles.ProductionManager]: "/production/dashboard",
  [WorkflowRoles.QAManager]: "/qa/dashboard",
  [WorkflowRoles.WarehouseManager]: "/warehouse/dashboard",
};

export function normalizeWorkflowRole(value?: string | null): WorkflowRole | null {
  if (!value) return null;
  const compact = value.trim().replace(/[-\s]/g, "_").toUpperCase();
  return roleAliasMap[compact] ?? null;
}
