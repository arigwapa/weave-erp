import { apiGet, apiPut } from "../http";

export interface FinanceBudgetPlannerProduct {
  ProductID: number;
  SKU: string;
  Name: string;
  TotalQty: number;
  TotalCost: number;
}

export interface FinanceBudgetPlannerCollection {
  CollectionID: number;
  CollectionCode: string;
  CollectionName: string;
  CollectionStatus: string;
  PlannerStatus: string;
  IsAdminApproved: boolean;
  AdminDecision: string;
  AdminDecisionReason: string;
  TotalBomCost: number;
  BudgetCap: number;
  WasteAllowanceBudget: number;
  Contingency: number;
  Forecast: number;
  ReservedAmount: number;
  SpentAmount: number;
  RemainingAmount: number;
  Readiness: "Complete" | "Review" | "Pending";
  HasSavedPlan: boolean;
  RiskFlags: string[];
  Products: FinanceBudgetPlannerProduct[];
}

export interface SaveFinanceBudgetPlannerPlanDto {
  BudgetCap: number;
  Contingency: number;
  WasteAllowanceBudget: number;
  Notes?: string;
}

export const financeBudgetPlannerApi = {
  listCollections: () =>
    apiGet<FinanceBudgetPlannerCollection[]>("/api/finance/budget-planner/collections"),
  savePlan: (collectionId: number, dto: SaveFinanceBudgetPlannerPlanDto) =>
    apiPut<FinanceBudgetPlannerCollection>(`/api/finance/budget-planner/collections/${collectionId}/plan`, dto),
};
