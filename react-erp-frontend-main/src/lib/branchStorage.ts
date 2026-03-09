import { apiGet, apiPut } from "./http";

export type BranchStatus = "Active" | "Inactive" | "At Risk";
export type BranchRegion = "Luzon" | "Visayas" | "Mindanao";

export type BranchRecord = {
  id: number;
  name: string;
  status: BranchStatus;
  warehouse: string;
  contact: string;
  region: BranchRegion;
};

export type WarehouseType = "CENTRAL" | "BRANCH";
export type WarehouseRecord = {
  id: number;
  name: string;
  address?: string;
  capacity: number;
  active: "Active" | "Inactive";
  warehouseManagerUserID?: number | null;
  warehouseManagerName?: string | null;
};

export const DEFAULT_BRANCHES: BranchRecord[] = [
  
];

const BRANCH_STORAGE_KEY = "erp.superadmin.branches";
const WAREHOUSE_STORAGE_KEY = "erp.superadmin.warehouses";
// BACKEND-TRACK: align with super admin endpoint contracts.
export const BRANCHES_API_PATH = "/api/superadmin/branches";
export const WAREHOUSES_API_PATH = "/api/superadmin/warehouses";

export const DEFAULT_WAREHOUSES: WarehouseRecord[] = [
  
];

export function loadBranches(): BranchRecord[] {
  try {
    const raw = localStorage.getItem(BRANCH_STORAGE_KEY);
    if (!raw) return DEFAULT_BRANCHES;
    const parsed = JSON.parse(raw) as BranchRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_BRANCHES;
    return parsed;
  } catch {
    return DEFAULT_BRANCHES;
  }
}

export function saveBranches(branches: BranchRecord[]): void {
  localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(branches));
}

export function loadWarehouses(): WarehouseRecord[] {
  try {
    const raw = localStorage.getItem(WAREHOUSE_STORAGE_KEY);
    if (!raw) return DEFAULT_WAREHOUSES;
    const parsed = JSON.parse(raw) as WarehouseRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_WAREHOUSES;
    return parsed;
  } catch {
    return DEFAULT_WAREHOUSES;
  }
}

export function saveWarehouses(warehouses: WarehouseRecord[]): void {
  localStorage.setItem(WAREHOUSE_STORAGE_KEY, JSON.stringify(warehouses));
}

// BACKEND-TRACK: page-level migration target.
// 1) call hydrateBranchWarehouseData() on mount
// 2) call persist*ToBackend() after local save
export async function hydrateBranchWarehouseData(): Promise<{
  branches: BranchRecord[];
  warehouses: WarehouseRecord[];
}> {
  try {
    const [branches, warehouses] = await Promise.all([
      apiGet<BranchRecord[]>(BRANCHES_API_PATH),
      apiGet<WarehouseRecord[]>(WAREHOUSES_API_PATH),
    ]);
    if (Array.isArray(branches) && branches.length > 0) saveBranches(branches);
    if (Array.isArray(warehouses) && warehouses.length > 0) saveWarehouses(warehouses);
    return {
      branches: Array.isArray(branches) ? branches : loadBranches(),
      warehouses: Array.isArray(warehouses) ? warehouses : loadWarehouses(),
    };
  } catch {
    return { branches: loadBranches(), warehouses: loadWarehouses() };
  }
}

export async function persistBranchesToBackend(
  branches: BranchRecord[],
): Promise<void> {
  try {
    await apiPut<void>(BRANCHES_API_PATH, { items: branches });
  } catch {
    // Intentionally non-blocking so local UX remains responsive.
  }
}

export async function persistWarehousesToBackend(
  warehouses: WarehouseRecord[],
): Promise<void> {
  try {
    await apiPut<void>(WAREHOUSES_API_PATH, { items: warehouses });
  } catch {
    // Intentionally non-blocking so local UX remains responsive.
  }
}
