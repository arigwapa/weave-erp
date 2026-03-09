export const CollectionStatuses = {
  Draft: "Draft",
  ForReview: "ForReview",
  Approved: "Approved",
  Archived: "Archived",
} as const;

export const ProductVersionStatuses = {
  Draft: "Draft",
  ForCosting: "ForCosting",
  Costed: "Costed",
  ForProduction: "ForProduction",
  Active: "Active",
  Obsolete: "Obsolete",
} as const;

export const BudgetRequestStatuses = {
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
  Cancelled: "Cancelled",
} as const;

export const ProductionOrderStatuses = {
  Planned: "Planned",
  Released: "Released",
  InProgress: "InProgress",
  Completed: "Completed",
  Cancelled: "Cancelled",
} as const;

export const QABatchStatuses = {
  Quarantine: "Quarantine",
  Passed: "Passed",
  Failed: "Failed",
  Released: "Released",
  Blocked: "Blocked",
} as const;

export const BatchStatuses = QABatchStatuses;

export const StockRequestStatuses = {
  Submitted: "Submitted",
  Approved: "Approved",
  Processing: "Processing",
  InTransit: "InTransit",
  Received: "Received",
  Rejected: "Rejected",
} as const;

export type CollectionStatus = (typeof CollectionStatuses)[keyof typeof CollectionStatuses];
export type ProductVersionStatus =
  (typeof ProductVersionStatuses)[keyof typeof ProductVersionStatuses];
export type BudgetRequestStatus =
  (typeof BudgetRequestStatuses)[keyof typeof BudgetRequestStatuses];
export type ProductionOrderStatus =
  (typeof ProductionOrderStatuses)[keyof typeof ProductionOrderStatuses];
export type QABatchStatus = (typeof QABatchStatuses)[keyof typeof QABatchStatuses];
export type StockRequestStatus =
  (typeof StockRequestStatuses)[keyof typeof StockRequestStatuses];
