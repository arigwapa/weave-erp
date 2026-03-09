import { apiGet, apiPost } from "../http";

export interface ProductionQueueItem {
  OrderID: number;
  VersionNumber?: string | null;
  CollectionID: number;
  CollectionCode: string;
  CollectionName: string;
  ProductID: number;
  ProductSKU: string;
  ProductName: string;
  BudgetID: number;
  BudgetCode: string;
  ApprovedBudget: number;
  PlannedQty: number;
  QueueStatus: "Pending" | "On Going" | "Completed";
  Readiness: string;
  DueDate: string;
  CurrentVersionID?: number | null;
  CurrentVersionNumber: string;
  SuggestedVersionNumber: string;
}

export interface StartProductionRunDto {
  CollectionID: number;
  ProductID: number;
  VersionNumber: string;
}

export const productionQueueApi = {
  list: () => apiGet<ProductionQueueItem[]>("/api/productionorder/queue"),
  startRun: (dto: StartProductionRunDto) =>
    apiPost<ProductionQueueItem>("/api/productionorder/queue/start-run", dto),
};

