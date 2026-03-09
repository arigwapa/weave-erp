import { apiGet } from "../http";

export interface ActivityLogItem {
  Id: number;
  Type: "Production" | "QA" | "Warehouse" | "Transfer" | "Request";
  Reference: string;
  Description: string;
  BranchID?: number | null;
  BranchName?: string | null;
  RegionID?: number | null;
  CreatedAt: string;
}

export const activityLogsApi = {
  production: (fromDate?: string, toDate?: string) =>
    apiGet<ActivityLogItem[]>(
      `/api/activity-logs/production${fromDate || toDate ? `?${new URLSearchParams({
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString()}` : ""}`,
    ),
  qa: (fromDate?: string, toDate?: string) =>
    apiGet<ActivityLogItem[]>(
      `/api/activity-logs/qa${fromDate || toDate ? `?${new URLSearchParams({
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString()}` : ""}`,
    ),
  warehouse: (fromDate?: string, toDate?: string) =>
    apiGet<ActivityLogItem[]>(
      `/api/activity-logs/warehouse${fromDate || toDate ? `?${new URLSearchParams({
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString()}` : ""}`,
    ),
  all: (fromDate?: string, toDate?: string) =>
    apiGet<ActivityLogItem[]>(
      `/api/activity-logs${fromDate || toDate ? `?${new URLSearchParams({
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      }).toString()}` : ""}`,
    ),
};

