import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../lib/AuthContext";
import { adminWorkflowApi, type NotificationCenterItem } from "../../lib/api/adminWorkflowApi";
import { getApiErrorMessage } from "../../lib/api/handleApiError";

export default function NotificationCenterPage() {
  const { role, branchId } = useAuth();
  const [notifications, setNotifications] = useState<NotificationCenterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    adminWorkflowApi
      .listNotificationCenter({ role, branchId })
      .then((items) => {
        if (!mounted) return;
        setNotifications(items);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(getApiErrorMessage(err));
        setNotifications([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [role, branchId]);

  const visibleNotifications = useMemo(() => {
    if (!role) return notifications;
    return notifications.filter(
      (item) => item.RoleTarget === "All" || item.RoleTarget === role,
    );
  }, [role, notifications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Notification Center</h1>
        <p className="mt-1 text-sm text-slate-500">
          Real-time alerts and historical notifications in a unified queue.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Includes in-app real-time updates and historical event records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading notifications...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : visibleNotifications.length === 0 ? (
            <p className="text-sm text-slate-500">No notifications found.</p>
          ) : (
            visibleNotifications.map((notification) => (
              <div
                key={notification.NotificationID}
                className={`rounded-xl border p-4 ${
                  notification.IsUnread
                    ? "border-indigo-200 bg-indigo-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{notification.Title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={notification.Channel === "Real-time" ? "default" : "secondary"}>
                      {notification.Channel}
                    </Badge>
                    {notification.IsUnread && <Badge variant="secondary">Unread</Badge>}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{notification.Message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {notification.Timestamp} • Target: {notification.RoleTarget}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
