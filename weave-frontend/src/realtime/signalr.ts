import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import toast from "react-hot-toast";
import { endpoints } from "../api/endpoints";
import { getToken } from "../lib/tokenStorage";
import { backendConfig } from "../lib/backendConfig";

const API_BASE_URL = backendConfig.apiBaseUrl;

let connection: HubConnection | null = null;
let startPromise: Promise<HubConnection> | null = null;
let authRetryBlockedUntil = 0;
let authToastBlockedUntil = 0;

function isUnauthorizedError(error: unknown): boolean {
  const text = String(error ?? "").toLowerCase();
  return text.includes("401") || text.includes("unauthorized");
}

function showSessionExpiredToast(): void {
  if (Date.now() < authToastBlockedUntil) return;
  authToastBlockedUntil = Date.now() + 30_000;
  toast.error("Session expired. Please log in again.");
}

export function getNotificationHubConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}${endpoints.hubs.notifications}`, {
        accessTokenFactory: () => getToken() ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
  }

  return connection;
}

export async function startNotificationHub(): Promise<HubConnection> {
  const token = getToken();
  if (!token) {
    return getNotificationHubConnection();
  }
  if (Date.now() < authRetryBlockedUntil) {
    return getNotificationHubConnection();
  }

  const conn = getNotificationHubConnection();
  if (conn.state === "Connected") {
    return conn;
  }

  if (startPromise) {
    return startPromise;
  }

  startPromise = (async () => {
    try {
      if (conn.state === "Disconnected") {
        await conn.start();
      } else {
        // Another caller may have already started/reconnected by now.
        while (conn.state !== "Connected") {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        authRetryBlockedUntil = Date.now() + 30_000;
        showSessionExpiredToast();
        return conn;
      }
      throw error;
    }
    return conn;
  })();

  try {
    return await startPromise;
  } finally {
    startPromise = null;
  }
}
