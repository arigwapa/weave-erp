import { apiGet, apiPut } from "./http";

export type RunScheduleStatus =
  | "For Scheduling"
  | "Schedule Ready"
  | "Run Candidate"
  | "Unpacked"
  | "Finished Run";

export type RunScheduleRecord = {
  key: string;
  collectionId: number;
  productId: number;
  runCode: string;
  lineTeam: string;
  ownerAssignment: string;
  startDate: string;
  endDate: string;
  plannedQty: number;
  status: RunScheduleStatus;
  source: "Scheduler" | "Queue";
  collectionCode: string;
  collectionName: string;
  productSKU: string;
  productName: string;
  linkedVersion?: string;
  sizePlan: Record<string, number>;
};

const RUN_SCHEDULE_STORAGE_KEY = "erp_production_run_schedules_v1";
// BACKEND-TRACK: align with run scheduler endpoint contract.
export const RUN_SCHEDULES_API_PATH = "/api/production/run-schedules";

export const DEFAULT_RUN_SCHEDULES: RunScheduleRecord[] = [];

const toStatus = (raw: unknown): RunScheduleStatus => {
  const value = String(raw ?? "").trim().toLowerCase();
  if (value === "for scheduling") return "For Scheduling";
  if (value === "schedule ready" || value === "ready" || value === "schedule set" || value === "planned") return "Schedule Ready";
  if (value === "run candidate" || value === "candidate") return "Run Candidate";
  if (value === "schedule running" || value === "active") return "Run Candidate";
  if (value === "unpacked") return "Unpacked";
  if (value === "batch ready") return "Unpacked";
  if (value === "finished run" || value === "completed") return "Finished Run";
  return "For Scheduling";
};

export const buildScheduleKey = (collectionId: number, productId: number) => `${collectionId}-${productId}`;

const normalizeRecord = (item: unknown): RunScheduleRecord | null => {
  if (!item || typeof item !== "object") return null;
  const source = item as Record<string, unknown>;
  const collectionId = Number(source.collectionId ?? source.CollectionID);
  const productId = Number(source.productId ?? source.ProductID);
  const runCode = String(source.runCode ?? source.RunCode ?? "").trim();
  if (!Number.isFinite(collectionId) || !Number.isFinite(productId) || !runCode) return null;

  const rawSizePlanJson = String(source.sizePlanJson ?? source.SizePlanJson ?? "").trim();
  const rawSizePlan = source.sizePlan;
  let sizePlan: Record<string, number> = {};
  if (rawSizePlan && typeof rawSizePlan === "object" && !Array.isArray(rawSizePlan)) {
    sizePlan = Object.fromEntries(
      Object.entries(rawSizePlan as Record<string, unknown>).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
    );
  } else if (rawSizePlanJson.startsWith("{")) {
    try {
      const parsed = JSON.parse(rawSizePlanJson) as Record<string, unknown>;
      sizePlan = Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
      );
    } catch {
      sizePlan = {};
    }
  }

  return {
    key: String(source.key ?? source.Key ?? buildScheduleKey(collectionId, productId)),
    collectionId,
    productId,
    runCode,
    lineTeam: String(source.lineTeam ?? source.LineTeam ?? ""),
    ownerAssignment: String(source.ownerAssignment ?? source.OwnerAssignment ?? ""),
    startDate: String(source.startDate ?? source.StartDate ?? ""),
    endDate: String(source.endDate ?? source.EndDate ?? ""),
    plannedQty: Math.max(1, Number(source.plannedQty ?? source.PlannedQty ?? 1) || 1),
    status: toStatus(source.status ?? source.Status),
    source: (source.source ?? source.Source) === "Scheduler" ? "Scheduler" : "Queue",
    collectionCode: String(source.collectionCode ?? source.CollectionCode ?? ""),
    collectionName: String(source.collectionName ?? source.CollectionName ?? ""),
    productSKU: String(source.productSKU ?? source.ProductSKU ?? ""),
    productName: String(source.productName ?? source.ProductName ?? ""),
    linkedVersion: source.linkedVersion ? String(source.linkedVersion) : source.LinkedVersion ? String(source.LinkedVersion) : undefined,
    sizePlan,
  };
};

export const loadRunSchedules = (): RunScheduleRecord[] => {
  if (typeof window === "undefined") return DEFAULT_RUN_SCHEDULES;
  try {
    const raw = window.localStorage.getItem(RUN_SCHEDULE_STORAGE_KEY);
    if (!raw) return DEFAULT_RUN_SCHEDULES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_RUN_SCHEDULES;
    return parsed.map(normalizeRecord).filter((item): item is RunScheduleRecord => !!item);
  } catch {
    return DEFAULT_RUN_SCHEDULES;
  }
};

export const saveRunSchedules = (items: RunScheduleRecord[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RUN_SCHEDULE_STORAGE_KEY, JSON.stringify(items));
};

// BACKEND-TRACK: page-level migration target.
// 1) call hydrateRunSchedules() on mount
// 2) call persistRunSchedulesToBackend() after local save
export const hydrateRunSchedules = async (): Promise<RunScheduleRecord[]> => {
  try {
    const records = await apiGet<unknown[]>(RUN_SCHEDULES_API_PATH);
    if (!Array.isArray(records)) return loadRunSchedules();
    const normalized = records.map(normalizeRecord).filter((item): item is RunScheduleRecord => !!item);
    saveRunSchedules(normalized);
    return normalized;
  } catch {
    return loadRunSchedules();
  }
};

export const persistRunSchedulesToBackend = async (
  items: RunScheduleRecord[],
): Promise<void> => {
  try {
    await apiPut<void>(RUN_SCHEDULES_API_PATH, {
      items: items.map((item) => ({
        ...item,
        SizePlanJson: JSON.stringify(item.sizePlan ?? {}),
      })),
    });
  } catch {
    // Intentionally non-blocking so local UX remains responsive.
  }
};
