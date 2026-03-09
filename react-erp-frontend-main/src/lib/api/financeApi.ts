import { apiGet } from "../http";

export interface FinanceSummaryItem {
  OrderID: number;
  RegionID: number;
  BranchID: number;
  VersionID: number;
  Status: string;
  StartDate: string;
  ActualOutputQty: number;
  WasteQty: number;
  MaterialCost: number;
  LaborCostEstimate: number;
  OverheadCostEstimate: number;
  WasteCost: number;
  TotalCOGS: number;
}

export const financeApi = {
  summary: (regionId?: number) =>
    apiGet<FinanceSummaryItem[]>(
      `/api/finance/summary${regionId ? `?regionId=${regionId}` : ""}`,
    ),
};

