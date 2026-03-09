import { apiGet, apiPut } from "../http";

export interface FinanceCostingBomLine {
  BillOfMaterialsID: number;
  MaterialName: string;
  QtyRequired: number;
  Unit: string;
  UnitCost: number;
}

export interface FinanceCostingProduct {
  ProductID: number;
  SKU: string;
  Name: string;
  SizeProfile: string;
  CostingStatus: string;
  ApprovalStatus: string;
  BomVersion: string;
  TotalCost: number;
  BomLines: FinanceCostingBomLine[];
}

export interface FinanceCostingCollection {
  CollectionID: number;
  CollectionCode: string;
  CollectionName: string;
  Status: string;
  CostingStatus: string;
  TotalBudgetNeeded: number;
  ProductCount: number;
  BomLineCount: number;
  Products: FinanceCostingProduct[];
}

export const financeCostingWorkbenchApi = {
  listQueue: () => apiGet<FinanceCostingCollection[]>("/api/finance/costing-workbench/queue"),
  approveProduct: (productId: number) =>
    apiPut<FinanceCostingProduct>(`/api/finance/costing-workbench/products/${productId}/approve`, {
      ApprovalStatus: "Approved",
    }),
  approveCollection: (collectionId: number) =>
    apiPut<FinanceCostingCollection>(`/api/finance/costing-workbench/collections/${collectionId}/approve`, {
      Status: "For Budget Planning",
    }),
};
