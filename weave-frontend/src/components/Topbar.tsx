// Topbar.tsx - shows the user's name, role, and avatar in the top right
// clicking the avatar goes to the profile page for that role

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { adminWorkflowApi, type NotificationCenterItem } from "../lib/api/adminWorkflowApi";
import { getApiErrorMessage } from "../lib/api/handleApiError";
import NotificationBell from "./NotificationBell";
import { StatusBadge } from "./ui/StatusBadge";
import { getNotificationHubConnection, startNotificationHub } from "../realtime/signalr";

// each role has its own profile page URL
const ROLE_PROFILE_ROUTES: Record<string, string> = {
  SuperAdmin: "/super-admin/settings",
  BranchAdmin: "/admin/profile",
  Admin: "/admin/profile",
  PLMManager: "/plm/profile",
  ProductionManager: "/production/profile",
  QAManager: "/qa/profile-settings",
  WarehouseManager: "/warehouse/profile-settings",
  FinanceManager: "/plm/profile",
  BranchManager: "/branch/profile",
  BRANCH_USER: "/branch/profile",
};

export default function Topbar() {
  const { user, role, branchId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isAdminArea = location.pathname.startsWith("/admin");
  const initials = user
    ? user.fullname
      ? user.fullname
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : user.username.slice(0, 2).toUpperCase()
    : "AD";

  // Look up the correct profile route for this user's role
  const profileRoute = user ? ROLE_PROFILE_ROUTES[user.roleName] ?? "/profile" : "/admin/profile";
  const visibleNotifications = useMemo(() => {
    if (!role) return notifications;
    return notifications.filter((item) => item.RoleTarget === "All" || item.RoleTarget === role);
  }, [notifications, role]);
  const unreadCount = visibleNotifications.filter((item) => item.IsUnread).length;

  useEffect(() => {
    if (!isAdminArea) return;
    let mounted = true;
    setIsLoadingNotifications(true);
    setNotificationError(null);
    adminWorkflowApi
      .listNotificationCenter({ role, branchId })
      .then((items) => {
        if (!mounted) return;
        setNotifications(items);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setNotificationError(getApiErrorMessage(err));
        setNotifications([]);
      })
      .finally(() => {
        if (mounted) setIsLoadingNotifications(false);
      });
    return () => {
      mounted = false;
    };
  }, [isAdminArea, role, branchId]);

  useEffect(() => {
    if (!isNotificationOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      const target = event.target as Node;
      if (!dropdownRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isNotificationOpen]);

  useEffect(() => {
    if (!isAdminArea || !user) return;
    const backendDisabled = (import.meta.env.VITE_DISABLE_BACKEND ?? "false") === "true";
    if (backendDisabled) return;

    let mounted = true;
    const onNotify = (payload: {
      NotificationID: number;
      Type: string;
      Message: string;
      IsRead: boolean;
      CreatedAt: string;
    }) => {
      if (!mounted) return;
      const next: NotificationCenterItem = {
        NotificationID: String(payload.NotificationID),
        RoleTarget: role ?? "Admin",
        Channel: payload.Type?.toLowerCase() === "alert" ? "Real-time" : "History",
        Title: payload.Type?.toLowerCase() === "alert" ? "System Alert" : "System Update",
        Message: payload.Message ?? "",
        Timestamp: payload.CreatedAt
          ? new Date(payload.CreatedAt).toLocaleString("en-PH", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        IsUnread: payload.IsRead === false,
      };

      setNotifications((prev) => {
        if (prev.some((item) => item.NotificationID === next.NotificationID)) return prev;
        return [next, ...prev].slice(0, 200);
      });
    };

    const setup = async () => {
      const hub = await startNotificationHub();
      if (!mounted) return;
      hub.on("notify", onNotify);
    };

    setup().catch(() => {
      // Silent fallback: notifications still load from API.
    });

    return () => {
      mounted = false;
      getNotificationHubConnection().off("notify", onNotify);
    };
  }, [isAdminArea, role, user]);

  return (
    <div
      className={`flex items-center gap-3 h-10 my-auto ${
        user ? "pl-6 border-l border-slate-200 dark:border-slate-700" : ""
      }`}
    >
      {user && <NotificationBell userId={user.userID} roleName={user.roleName} />}
      {isAdminArea && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="relative w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors flex items-center justify-center"
            aria-label="Open notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-[360px] max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <p className="text-xs text-slate-500">Real-time and historical alerts</p>
              </div>

              <div className="p-3 space-y-2">
                {isLoadingNotifications ? (
                  <p className="text-xs text-slate-500 px-1 py-2">Loading notifications...</p>
                ) : notificationError ? (
                  <p className="text-xs text-rose-600 px-1 py-2">{notificationError}</p>
                ) : visibleNotifications.length === 0 ? (
                  <p className="text-xs text-slate-500 px-1 py-2">No notifications found.</p>
                ) : (
                  visibleNotifications.map((item) => (
                    <div
                      key={item.NotificationID}
                      className={`rounded-xl border p-3 ${
                        item.IsUnread ? "border-indigo-200 bg-indigo-50/60" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{item.Title}</p>
                        <StatusBadge status={item.Channel} />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{item.Message}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{item.Timestamp}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {user && (
        <>
          {/* user info, hidden on mobile */}
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {user.fullname || user.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.roleName} &middot;{" "}
              {user.branchName || `Branch ${user.branchID}`}
            </p>
          </div>

          {/* avatar, goes to profile */}
          <button
            onClick={() => navigate(profileRoute)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:shadow-md transition-shadow ring-2 ring-white dark:ring-slate-800"
            title="Go to Profile"
          >
            {initials}
          </button>
        </>
      )}
    </div>
  );
}
