import { apiGet, apiPut } from "./http";

export type BatchStatus =
  | "In Progress"
  | "Completed"
  | "Submitted"
  | "Approved"
  | "Disapproved"
  | "Blocked";

export type BatchRecord = {
  code: string;
  orderId: number;
  versionNumber: string;
  productId: number;
  collectionId: number;
  collectionCode: string;
  collectionName: string;
  productSku: string;
  runCode: string;
  scheduleKey: string;
  sourceStatus: string;
  product: string;
  version: string;
  size: string;
  qty: number;
  status: BatchStatus;
  handoffNotes?: string;
};

export type BatchCandidate = {
  orderId: number;
  versionNumber: string;
  productId: number;
  collectionId: number;
  collectionCode: string;
  collectionName: string;
  productSku: string;
  productName: string;
  runCode: string;
  scheduleKey: string;
  sourceStatus: string;
  plannedQty: number;
  sizePlan: Record<string, number>;
};

const BATCH_STORAGE_KEY = "erp_production_batches_v1";
// BACKEND-TRACK: align with production batch endpoint contract.
export const BATCHES_API_PATH = "/api/production/batches";
export const BATCH_CANDIDATES_API_PATH = "/api/production/batches/candidates";

export const DEFAULT_BATCHES: BatchRecord[] = [];

const normalizeStatus = (raw: unknown): BatchStatus => {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "completed") return "Completed";
  if (value === "sent to qa" || value === "submitted") return "Submitted";
  if (value === "approved") return "Approved";
  if (value === "disapproved" || value === "dissaproved") return "Disapproved";
  if (value === "blocked") return "Blocked";
  return "In Progress";
};

const normalizeBatchRecord = (raw: unknown): BatchRecord | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const code = String(source.code ?? source.Code ?? "").trim();
  if (!code) return null;

  return {
    code,
    orderId: Math.max(0, Number(source.orderId ?? source.OrderID ?? 0) || 0),
    versionNumber: String(source.versionNumber ?? source.VersionNumber ?? "").trim(),
    productId: Math.max(0, Number(source.productId ?? source.ProductID ?? 0) || 0),
    collectionId: Math.max(0, Number(source.collectionId ?? source.CollectionID ?? 0) || 0),
    collectionCode: String(source.collectionCode ?? source.CollectionCode ?? "").trim(),
    collectionName: String(source.collectionName ?? source.CollectionName ?? "").trim(),
    productSku: String(source.productSku ?? source.ProductSKU ?? "").trim(),
    runCode: String(source.runCode ?? source.RunCode ?? "").trim(),
    scheduleKey: String(source.scheduleKey ?? source.ScheduleKey ?? "").trim(),
    sourceStatus: String(source.sourceStatus ?? source.SourceStatus ?? "").trim(),
    product: String(source.product ?? source.Product ?? "").trim(),
    version: String(source.version ?? source.Version ?? "").trim(),
    size: String(source.size ?? source.Size ?? "").trim(),
    qty: Math.max(1, Number(source.qty ?? source.Qty ?? 1) || 1),
    status: normalizeStatus(source.status ?? source.Status),
    handoffNotes: source.handoffNotes
      ? String(source.handoffNotes)
      : source.HandoffNotes
        ? String(source.HandoffNotes)
        : undefined,
  };
};

export const loadBatches = (): BatchRecord[] => {
  if (typeof window === "undefined") return DEFAULT_BATCHES;
  try {
    const raw = window.localStorage.getItem(BATCH_STORAGE_KEY);
    if (!raw) return DEFAULT_BATCHES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_BATCHES;
    return parsed.map(normalizeBatchRecord).filter((item): item is BatchRecord => !!item);
  } catch {
    return DEFAULT_BATCHES;
  }
};

export const saveBatches = (items: BatchRecord[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(items));
};

// BACKEND-TRACK: page-level migration target.
// 1) call hydrateBatches() on mount
// 2) call persistBatchesToBackend() after local save
export const hydrateBatches = async (): Promise<BatchRecord[]> => {
  try {
    const records = await apiGet<unknown[]>(BATCHES_API_PATH);
    if (!Array.isArray(records)) return loadBatches();
    const normalized = records.map(normalizeBatchRecord).filter((item): item is BatchRecord => !!item);
    saveBatches(normalized);
    return normalized;
  } catch {
    return loadBatches();
  }
};

export const persistBatchesToBackend = async (
  items: BatchRecord[],
): Promise<void> => {
  try {
    await apiPut<void>(BATCHES_API_PATH, { items });
  } catch {
    // Intentionally non-blocking so local UX remains responsive.
  }
};

const normalizeSizePlan = (raw: unknown): Record<string, number> => {
  if (!raw || typeof raw !== "object") return {};
  const source = raw as Record<string, unknown>;
  return Object.entries(source).reduce<Record<string, number>>((acc, [key, value]) => {
    const size = String(key ?? "").trim();
    const qty = Number(value ?? 0);
    if (size && Number.isFinite(qty) && qty > 0) {
      acc[size] = qty;
    }
    return acc;
  }, {});
};

const normalizeBatchCandidate = (raw: unknown): BatchCandidate | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const scheduleKey = String(source.scheduleKey ?? source.ScheduleKey ?? "").trim();
  const productId = Math.max(0, Number(source.productId ?? source.ProductID ?? 0) || 0);
  const collectionId = Math.max(0, Number(source.collectionId ?? source.CollectionID ?? 0) || 0);
  if (!scheduleKey || productId <= 0 || collectionId <= 0) return null;

  return {
    orderId: Math.max(0, Number(source.orderId ?? source.OrderID ?? 0) || 0),
    versionNumber: String(source.versionNumber ?? source.VersionNumber ?? "").trim(),
    productId,
    collectionId,
    collectionCode: String(source.collectionCode ?? source.CollectionCode ?? "").trim(),
    collectionName: String(source.collectionName ?? source.CollectionName ?? "").trim(),
    productSku: String(source.productSku ?? source.ProductSKU ?? "").trim(),
    productName: String(source.productName ?? source.ProductName ?? "").trim(),
    runCode: String(source.runCode ?? source.RunCode ?? "").trim(),
    scheduleKey,
    sourceStatus: String(source.sourceStatus ?? source.SourceStatus ?? "").trim(),
    plannedQty: Math.max(1, Number(source.plannedQty ?? source.PlannedQty ?? 1) || 1),
    sizePlan: normalizeSizePlan(source.sizePlan ?? source.SizePlan),
  };
};

export const listBatchCandidates = async (): Promise<BatchCandidate[]> => {
  try {
    const records = await apiGet<unknown[]>(BATCH_CANDIDATES_API_PATH);
    if (!Array.isArray(records)) return [];
    return records
      .map(normalizeBatchCandidate)
      .filter((item): item is BatchCandidate => !!item);
  } catch {
    return [];
  }
};
