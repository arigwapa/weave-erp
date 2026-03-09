import { apiGet } from "../http";

export interface PlmRevisionQueueItem {
  CollectionID: number;
  CollectionCode: string;
  CollectionName: string;
  Season: string;
  Status: string;
  AdminDecision: string;
  AdminDecisionReason: string;
  UpdatedAt: string;
  IsRevision: boolean;
}

export const plmRevisionsApi = {
  list: () => apiGet<PlmRevisionQueueItem[]>("/api/plm/revisions"),
};
