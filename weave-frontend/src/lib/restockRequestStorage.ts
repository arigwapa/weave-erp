import { apiGet, apiPut } from "./http";

export type RestockPriority = "Critical" | "High" | "Medium";
export type RestockRequestStatus = "Pending" | "In Review" | "Approved" | "Dispatched" | "Rejected";

export type RestockRequestRecord = {
  id: string;
  sku: string;
  category: string;
  size: string;
  requestedQty: number;
  priority: RestockPriority;
  note: string;
  requestedAt: string;
  requestedBy: string;
  branchName: string;
  onHand: number;
  reorderLevel: number;
  status: RestockRequestStatus;
  targetRole: "Admin";
};

const RESTOCK_REQUESTS_STORAGE_KEY = "erp.branch.restock.requests";
// BACKEND-TRACK: align with branch restock endpoint contract.
export const RESTOCK_REQUESTS_API_PATH = "/api/branch/restock-requests";

const DEFAULT_RESTOCK_REQUESTS: RestockRequestRecord[] = [];

export function loadRestockRequests(): RestockRequestRecord[] {
  try {
    const raw = localStorage.getItem(RESTOCK_REQUESTS_STORAGE_KEY);
    if (!raw) return DEFAULT_RESTOCK_REQUESTS;
    const parsed = JSON.parse(raw) as RestockRequestRecord[];
    if (!Array.isArray(parsed)) return DEFAULT_RESTOCK_REQUESTS;
    return parsed;
  } catch {
    return DEFAULT_RESTOCK_REQUESTS;
  }
}

export function saveRestockRequests(records: RestockRequestRecord[]): void {
  localStorage.setItem(RESTOCK_REQUESTS_STORAGE_KEY, JSON.stringify(records));
}

export function createRestockRequestId(records: RestockRequestRecord[]): string {
  const maxSeq = records.reduce((max, record) => {
    const parts = record.id.split("-");
    const seq = Number(parts[2] || 0);
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
  return `RR-2603-${String(maxSeq + 1).padStart(4, "0")}`;
}

// BACKEND-TRACK: page-level migration target.
// 1) call hydrateRestockRequests() on mount
// 2) call persistRestockRequestsToBackend() after local save
export async function hydrateRestockRequests(): Promise<RestockRequestRecord[]> {
  try {
    const records = await apiGet<RestockRequestRecord[]>(RESTOCK_REQUESTS_API_PATH);
    if (!Array.isArray(records)) return loadRestockRequests();
    saveRestockRequests(records);
    return records;
  } catch {
    return loadRestockRequests();
  }
}

export async function persistRestockRequestsToBackend(
  records: RestockRequestRecord[],
): Promise<void> {
  try {
    await apiPut<void>(RESTOCK_REQUESTS_API_PATH, { items: records });
  } catch {
    // Intentionally non-blocking so local UX remains responsive.
  }
}
