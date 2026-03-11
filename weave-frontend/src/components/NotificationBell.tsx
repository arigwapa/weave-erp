import { useEffect } from "react";
import toast from "react-hot-toast";
import { getNotificationHubConnection, startNotificationHub } from "../realtime/signalr";

type RealtimeNotification = {
  NotificationID: number;
  UserID?: number | null;
  RegionID?: number | null;
  Type: string;
  Message: string;
  IsRead: boolean;
  CreatedAt: string;
};

type NotificationBellProps = {
  userId?: number;
  regionId?: number;
  roleName?: string;
};

export default function NotificationBell({ userId, regionId, roleName }: NotificationBellProps) {
  useEffect(() => {
    const backendDisabled = (import.meta.env.VITE_DISABLE_BACKEND ?? "false") === "true";
    if (backendDisabled) {
      return;
    }

    let isMounted = true;
    const onNotify = (payload: RealtimeNotification) => {
      toast(payload.Message, { icon: "🔔" });
    };

    const setup = async () => {
      const hub = await startNotificationHub();
      if (!isMounted) return;

      if (typeof userId === "number") {
        await hub.invoke("JoinUserGroup", userId);
      }
      if (typeof regionId === "number") {
        await hub.invoke("JoinRegionGroup", regionId);
      }
      if (roleName && roleName.trim().length > 0) {
        await hub.invoke("JoinRoleGroup", roleName);
      }

      hub.on("notify", onNotify);
    };

    setup().catch((error) => {
      // Avoid noisy console errors when backend is temporarily offline.
      console.warn("Notification hub unavailable:", error);
    });

    return () => {
      isMounted = false;
      getNotificationHubConnection().off("notify", onNotify);
    };
  }, [userId, regionId, roleName]);

  return null;
}
