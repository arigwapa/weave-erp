import {
  BudgetRequestStatuses,
  CollectionStatuses,
  ProductionOrderStatuses,
  ProductVersionStatuses,
  QABatchStatuses,
  StockRequestStatuses,
  type BudgetRequestStatus,
  type CollectionStatus,
  type ProductionOrderStatus,
  type ProductVersionStatus,
  type QABatchStatus,
  type StockRequestStatus,
} from "../constants/workflowStatus";

function normalize(input?: string | null): string {
  return (input ?? "").trim().replace(/[-\s]/g, "_").toUpperCase();
}

export function mapCollectionStatus(raw?: string | null): CollectionStatus {
  switch (normalize(raw)) {
    case "FOR_REVIEW":
      return CollectionStatuses.ForReview;
    case "APPROVED":
      return CollectionStatuses.Approved;
    case "ARCHIVED":
      return CollectionStatuses.Archived;
    default:
      return CollectionStatuses.Draft;
  }
}

export function mapProductVersionStatus(raw?: string | null): ProductVersionStatus {
  switch (normalize(raw)) {
    case "FOR_COSTING":
    case "PENDING_COSTING":
      return ProductVersionStatuses.ForCosting;
    case "COSTED":
      return ProductVersionStatuses.Costed;
    case "FOR_PRODUCTION":
    case "READY_FOR_MANUFACTURING":
      return ProductVersionStatuses.ForProduction;
    case "ACTIVE":
    case "RELEASED":
      return ProductVersionStatuses.Active;
    case "OBSOLETE":
      return ProductVersionStatuses.Obsolete;
    default:
      return ProductVersionStatuses.Draft;
  }
}

export function mapBudgetRequestStatus(raw?: string | null): BudgetRequestStatus {
  switch (normalize(raw)) {
    case "APPROVED":
      return BudgetRequestStatuses.Approved;
    case "REJECTED":
      return BudgetRequestStatuses.Rejected;
    case "CANCELLED":
      return BudgetRequestStatuses.Cancelled;
    default:
      return BudgetRequestStatuses.Pending;
  }
}

export function mapProductionOrderStatus(raw?: string | null): ProductionOrderStatus {
  switch (normalize(raw)) {
    case "RELEASED":
      return ProductionOrderStatuses.Released;
    case "IN_PROGRESS":
    case "INPROGRESS":
      return ProductionOrderStatuses.InProgress;
    case "COMPLETED":
      return ProductionOrderStatuses.Completed;
    case "CANCELLED":
      return ProductionOrderStatuses.Cancelled;
    default:
      return ProductionOrderStatuses.Planned;
  }
}

export function mapQABatchStatus(raw?: string | null): QABatchStatus {
  switch (normalize(raw)) {
    case "PASSED":
      return QABatchStatuses.Passed;
    case "FAILED":
    case "QA_FAILED":
      return QABatchStatuses.Failed;
    case "RELEASED":
      return QABatchStatuses.Released;
    case "BLOCKED":
      return QABatchStatuses.Blocked;
    default:
      return QABatchStatuses.Quarantine;
  }
}

export function mapStockRequestStatus(raw?: string | null): StockRequestStatus {
  switch (normalize(raw)) {
    case "APPROVED":
      return StockRequestStatuses.Approved;
    case "PROCESSING":
      return StockRequestStatuses.Processing;
    case "IN_TRANSIT":
      return StockRequestStatuses.InTransit;
    case "RECEIVED":
      return StockRequestStatuses.Received;
    case "REJECTED":
      return StockRequestStatuses.Rejected;
    default:
      return StockRequestStatuses.Submitted;
  }
}
