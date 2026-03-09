import { apiGet, apiPost } from "../http";

export interface NotificationItem {
  NotificationID: number;
  UserID?: number | null;
  RegionID?: number | null;
  Type: string;
  Message: string;
  IsRead: boolean;
  CreatedAt: string;
}

export const notificationApi = {
  list: (type?: "Alert" | "System") =>
    apiGet<NotificationItem[]>(
      `/api/notifications${type ? `?type=${encodeURIComponent(type)}` : ""}`,
    ),
  create: (dto: {
    UserID?: number;
    RegionID?: number;
    Type: "Alert" | "System";
    Message: string;
  }) => apiPost<NotificationItem>("/api/notifications", dto),
  markRead: (id: number) => apiPost(`/api/notifications/${id}/mark-read`, {}),
};

