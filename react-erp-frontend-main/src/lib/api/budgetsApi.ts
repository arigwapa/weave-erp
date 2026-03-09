import { apiGet, apiPost, apiPut } from "../http";

export type BudgetStatus =
  | "Draft"
  | "PendingApproval"
  | "Approved"
  | "Rejected"
  | "Locked"
  | "Archived";

export interface Budget {
  BudgetID: number;
  BudgetCode: string;
  Name: string;
  RegionID?: number | null;
  RegionName?: string | null;
  AppliesToAll?: boolean;
  PeriodStart: string;
  PeriodEnd: string;
  MaterialsBudget: number;
  LaborBudget: number;
  OverheadBudget: number;
  WasteAllowanceBudget: number;
  TotalBudget: number;
  ReservedAmount: number;
  SpentAmount: number;
  RemainingAmount: number;
  Status: BudgetStatus;
  Notes: string;
  RejectionReason?: string | null;
  CreatedByUserID: number;
  SubmittedByUserID?: number | null;
  SubmittedAt?: string | null;
  ApprovedByUserID?: number | null;
  ApprovedAt?: string | null;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface CreateBudgetDto {
  Name: string;
  RegionID?: number | null;
  AppliesToAll?: boolean;
  PeriodStart: string;
  PeriodEnd: string;
  MaterialsBudget: number;
  LaborBudget: number;
  OverheadBudget: number;
  WasteAllowanceBudget: number;
  Notes?: string;
}

export interface BudgetApprovalItem {
  BudgetID: number;
  BudgetCode: string;
  Name: string;
  RegionID?: number | null;
  RegionName?: string | null;
  AppliesToAll?: boolean;
  PeriodStart: string;
  PeriodEnd: string;
  TotalBudget: number;
  ReservedAmount: number;
  SpentAmount: number;
  RemainingAmount: number;
  Status: BudgetStatus;
  Notes: string;
  SubmittedAt?: string | null;
  SubmittedByUserID?: number | null;
}

export interface BudgetReservationResult {
  BudgetReservationID: number;
  BudgetID: number;
  VersionID: number;
  MaterialAmount: number;
  LaborAmount: number;
  OverheadAmount: number;
  TotalAmount: number;
  RemainingAmount: number;
  Status: string;
}

export const budgetsApi = {
  list: () => apiGet<Budget[]>("/api/budgets"),
  listApproved: () => apiGet<Budget[]>("/api/budgets/approved"),
  create: (dto: CreateBudgetDto) => apiPost<Budget>("/api/budgets", dto),
  update: (id: number, dto: CreateBudgetDto) => apiPut<Budget>(`/api/budgets/${id}`, dto),
  submit: (id: number) => apiPost<Budget>(`/api/budgets/${id}/submit`, {}),
  listApprovals: (status?: string) =>
    apiGet<BudgetApprovalItem[]>(`/api/budgets/approvals${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  approve: (id: number) => apiPost<Budget>(`/api/budgets/${id}/approve`, {}),
  reject: (id: number, reason: string) =>
    apiPost<Budget>(`/api/budgets/${id}/reject`, { Reason: reason }),
  reserveForVersion: (budgetId: number, versionId: number) =>
    apiPost<BudgetReservationResult>(`/api/budgets/${budgetId}/reserve-for-version/${versionId}`, {}),
};
