// useRealtimeToasts.ts - connects SignalR on login, disconnects on logout,
// and pops a toast for each realtime event (production, batch, inventory)
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import {
  startRealtime,
  stopRealtime,
  onProductionUpdated,
  onBatchStatusChanged,
  onInventoryAlert,
  onRequestCreated,
  onRequestApproved,
  onRequestRejected,
  onDeliveryScheduled,
  onDelivered,
  onBackorderCreated,
  onBudgetSubmitted,
  onBudgetApproved,
  onProductReleased,
} from "./realtime";

const BACKEND_DISABLED = (import.meta.env.VITE_DISABLE_BACKEND ?? "true") === "true";
let pendingStopTimer: ReturnType<typeof setTimeout> | null = null;

function isBenignNegotiationStop(error: unknown): boolean {
  const message = (error as Error)?.message?.toLowerCase() ?? "";
  return message.includes("stopped during negotiation");
}

export function useRealtimeToasts() {
  const { user } = useAuth();

  useEffect(() => {
    if (pendingStopTimer) {
      clearTimeout(pendingStopTimer);
      pendingStopTimer = null;
    }

    if (BACKEND_DISABLED) {
      stopRealtime();
      return;
    }

    // no user = no websocket
    if (!user) {
      stopRealtime();
      return;
    }

    // logged in, fire up the connection
    startRealtime().catch((err) => {
      if (isBenignNegotiationStop(err)) return;
      console.warn("SignalR connection failed:", err);
    });

    // show a toast for each event type
    const unsubs = [
      onProductionUpdated((d) => {
        toast(`Production updated: Order #${d.orderID} — Output ${d.outputQty}, Waste ${d.wasteQty}`, {
          icon: "🏭",
          duration: 5000,
        });
      }),
      onBatchStatusChanged((d) => {
        toast(`Batch #${d.batchID}: ${d.oldStatus} → ${d.newStatus} (${d.result})`, {
          icon: "🔍",
          duration: 5000,
        });
      }),
      onInventoryAlert((d) => {
        toast.error(`Low stock: ${d.message} (Qty: ${d.quantityOnHand})`, {
          duration: 8000,
        });
      }),
      onRequestCreated((d) => {
        toast(`Request #${d.requestID} created (${d.status})`, {
          icon: "📦",
          duration: 5000,
        });
      }),
      onRequestApproved((d) => {
        toast.success(`Request #${d.requestID} approved`, { duration: 5000 });
      }),
      onRequestRejected((d) => {
        toast.error(`Request #${d.requestID} rejected`, { duration: 5000 });
      }),
      onDeliveryScheduled((d) => {
        toast(`Delivery scheduled for Request #${d.requestID}`, {
          icon: "🚚",
          duration: 5000,
        });
      }),
      onDelivered((d) => {
        toast.success(`Request #${d.requestID} delivered`, { duration: 5000 });
      }),
      onBackorderCreated((d) => {
        toast(`Request #${d.requestID} moved to backorder`, {
          icon: "⏳",
          duration: 5000,
        });
      }),
      onBudgetSubmitted((d) => {
        toast(`Budget #${d.budgetID} submitted for approval`, {
          icon: "💼",
          duration: 5000,
        });
      }),
      onBudgetApproved((d) => {
        toast.success(`Budget #${d.budgetID} approved`, { duration: 5000 });
      }),
      onProductReleased((d) => {
        toast.success(`Version #${d.versionID} released to production`, {
          duration: 5000,
        });
      }),
    ];

    return () => {
      unsubs.forEach((fn) => fn());
      // In dev StrictMode/HMR, effects mount/unmount rapidly.
      // Delay stop briefly so immediate remount can reuse connection.
      pendingStopTimer = setTimeout(() => {
        void stopRealtime();
        pendingStopTimer = null;
      }, 500);
    };
  }, [user]);
}
