import { apiGet } from "../http";

export type TaskPriority = "High" | "Medium" | "Low";
export type TimelineStatus = "Done" | "In Progress" | "Blocked";
export type ApprovalDecision = "Approved" | "Rejected" | "Returned";

export interface TaskInboxItem {
  TaskID: string;
  Role: string;
  Action: string;
  CollectionCode: string;
  VersionLabel: string;
  DueIn: string;
  Priority: TaskPriority;
}

export interface WorkflowTimelineItem {
  EventID: string;
  CollectionCode: string;
  VersionLabel: string;
  Stage: string;
  OwnerRole: string;
  Timestamp: string;
  Status: TimelineStatus;
}

export interface ApprovalHistoryItem {
  ApprovalID: string;
  CollectionCode: string;
  VersionLabel: string;
  ReviewerName: string;
  Decision: ApprovalDecision;
  Reason: string;
  ActedAt: string;
}

export interface NotificationCenterItem {
  NotificationID: string;
  RoleTarget: string;
  Channel: "Real-time" | "History";
  Title: string;
  Message: string;
  Timestamp: string;
  IsUnread: boolean;
}

type ListOptions = {
  role?: string | null;
  branchId?: number | null;
};

function withParams(path: string, params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export const adminWorkflowApi = {
  listTaskInbox: (opts: ListOptions = {}) =>
    apiGet<TaskInboxItem[]>(
      withParams("/api/admin/task-inbox", {
        role: opts.role ?? undefined,
        branchId: opts.branchId ?? undefined,
      }),
    ),

  listWorkflowTimeline: (opts: ListOptions = {}) =>
    apiGet<WorkflowTimelineItem[]>(
      withParams("/api/admin/workflow-timeline", {
        role: opts.role ?? undefined,
        branchId: opts.branchId ?? undefined,
      }),
    ),

  listApprovalsHistory: (opts: ListOptions = {}) =>
    apiGet<ApprovalHistoryItem[]>(
      withParams("/api/admin/approvals-history", {
        role: opts.role ?? undefined,
        branchId: opts.branchId ?? undefined,
      }),
    ),

  listNotificationCenter: (opts: ListOptions = {}) =>
    apiGet<NotificationCenterItem[]>(
      withParams("/api/admin/notification-center", {
        role: opts.role ?? undefined,
        branchId: opts.branchId ?? undefined,
      }),
    ),
};
