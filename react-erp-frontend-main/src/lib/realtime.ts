// realtime.ts - manages the SignalR websocket connection to the backend
// listens for ProductionUpdated, BatchStatusChanged, and InventoryAlert events
// other parts of the app subscribe via onProductionUpdated(), onBatchStatusChanged(), etc.
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import toast from "react-hot-toast";
import { getToken } from "./tokenStorage";

const API = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API ?? "http://localhost:5138";
const HUB_URL = `${BASE_URL}/hubs/notifications`;

// event payloads (match the C# DTOs on the backend)

export interface ProductionUpdatedEvent {
  orderID: number;
  logID: number;
  outputQty: number;
  wasteQty: number;
  logDate: string;
  branchID: number;
}

export interface BatchStatusChangedEvent {
  batchID: number;
  orderID: number;
  oldStatus: string;
  newStatus: string;
  inspectionID: number;
  result: string;
  branchID: number;
}

export interface InventoryAlertEvent {
  inventoryType: string;
  inventoryId: number;
  binID: number;
  itemId: number;
  quantityOnHand: number;
  threshold: number;
  branchID: number;
  message: string;
  timestamp: string;
}

export interface ProductRequestEvent {
  requestID: number;
  fromBranchID: number;
  toRegionID: number;
  status: string;
  message: string;
  timestamp: string;
}

export interface BudgetEvent {
  budgetID: number;
  status: string;
  regionID?: number;
  performedByUserID: number;
  timestamp: string;
}

export interface ProductReleasedEvent {
  versionID: number;
  productID: number;
  budgetID: number;
  timestamp: string;
}

// keeps the last 50 events in memory for the debug panel

export interface RealtimeLogEntry {
  id: number;
  event: string;
  data: unknown;
  time: Date;
}

const MAX_LOG = 50;
let logSeq = 0;
let eventLog: RealtimeLogEntry[] = [];
type LogListener = (entries: RealtimeLogEntry[]) => void;
const logListeners = new Set<LogListener>();

function pushLog(event: string, data: unknown) {
  const entry: RealtimeLogEntry = {
    id: ++logSeq,
    event,
    data,
    time: new Date(),
  };
  eventLog = [entry, ...eventLog].slice(0, MAX_LOG);
  logListeners.forEach((fn) => fn(eventLog));
}

export function getEventLog(): RealtimeLogEntry[] {
  return eventLog;
}

export function subscribeLog(fn: LogListener): () => void {
  logListeners.add(fn);
  return () => logListeners.delete(fn);
}

// pub-sub handlers for each event type

type Handler<T> = (data: T) => void;
const productionHandlers = new Set<Handler<ProductionUpdatedEvent>>();
const batchHandlers = new Set<Handler<BatchStatusChangedEvent>>();
const inventoryHandlers = new Set<Handler<InventoryAlertEvent>>();
const requestCreatedHandlers = new Set<Handler<ProductRequestEvent>>();
const requestApprovedHandlers = new Set<Handler<ProductRequestEvent>>();
const requestRejectedHandlers = new Set<Handler<ProductRequestEvent>>();
const deliveryScheduledHandlers = new Set<Handler<ProductRequestEvent>>();
const deliveredHandlers = new Set<Handler<ProductRequestEvent>>();
const backorderHandlers = new Set<Handler<ProductRequestEvent>>();
const budgetSubmittedHandlers = new Set<Handler<BudgetEvent>>();
const budgetApprovedHandlers = new Set<Handler<BudgetEvent>>();
const productReleasedHandlers = new Set<Handler<ProductReleasedEvent>>();

export function onProductionUpdated(fn: Handler<ProductionUpdatedEvent>): () => void {
  productionHandlers.add(fn);
  return () => productionHandlers.delete(fn);
}

export function onBatchStatusChanged(fn: Handler<BatchStatusChangedEvent>): () => void {
  batchHandlers.add(fn);
  return () => batchHandlers.delete(fn);
}

export function onInventoryAlert(fn: Handler<InventoryAlertEvent>): () => void {
  inventoryHandlers.add(fn);
  return () => inventoryHandlers.delete(fn);
}

export function onRequestCreated(fn: Handler<ProductRequestEvent>): () => void {
  requestCreatedHandlers.add(fn);
  return () => requestCreatedHandlers.delete(fn);
}

export function onRequestApproved(fn: Handler<ProductRequestEvent>): () => void {
  requestApprovedHandlers.add(fn);
  return () => requestApprovedHandlers.delete(fn);
}

export function onRequestRejected(fn: Handler<ProductRequestEvent>): () => void {
  requestRejectedHandlers.add(fn);
  return () => requestRejectedHandlers.delete(fn);
}

export function onDeliveryScheduled(fn: Handler<ProductRequestEvent>): () => void {
  deliveryScheduledHandlers.add(fn);
  return () => deliveryScheduledHandlers.delete(fn);
}

export function onDelivered(fn: Handler<ProductRequestEvent>): () => void {
  deliveredHandlers.add(fn);
  return () => deliveredHandlers.delete(fn);
}

export function onBackorderCreated(fn: Handler<ProductRequestEvent>): () => void {
  backorderHandlers.add(fn);
  return () => backorderHandlers.delete(fn);
}

export function onBudgetSubmitted(fn: Handler<BudgetEvent>): () => void {
  budgetSubmittedHandlers.add(fn);
  return () => budgetSubmittedHandlers.delete(fn);
}

export function onBudgetApproved(fn: Handler<BudgetEvent>): () => void {
  budgetApprovedHandlers.add(fn);
  return () => budgetApprovedHandlers.delete(fn);
}

export function onProductReleased(fn: Handler<ProductReleasedEvent>): () => void {
  productReleasedHandlers.add(fn);
  return () => productReleasedHandlers.delete(fn);
}

// connection state tracking so the UI can show connected/disconnected

type StateListener = (state: HubConnectionState) => void;
const stateListeners = new Set<StateListener>();

export function subscribeConnectionState(fn: StateListener): () => void {
  stateListeners.add(fn);
  return () => stateListeners.delete(fn);
}

function notifyState(state: HubConnectionState) {
  stateListeners.forEach((fn) => fn(state));
}

export function getConnectionState(): HubConnectionState {
  return connection?.state ?? HubConnectionState.Disconnected;
}

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
let stopPromise: Promise<void> | null = null;
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

function ensureConnection(): HubConnection {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => getToken() ?? "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  // listen for the three event types from the hub
  const onProductionEvent = (eventName: string, data: ProductionUpdatedEvent) => {
    pushLog(eventName, data);
    productionHandlers.forEach((fn) => fn(data));
  };
  connection.on("ProductionUpdated", (data: ProductionUpdatedEvent) => {
    onProductionEvent("ProductionUpdated", data);
  });
  connection.on("ProductionLogAdded", (data: ProductionUpdatedEvent) => {
    onProductionEvent("ProductionLogAdded", data);
  });

  const onBatchEvent = (eventName: string, data: BatchStatusChangedEvent) => {
    pushLog(eventName, data);
    batchHandlers.forEach((fn) => fn(data));
  };
  connection.on("BatchStatusChanged", (data: BatchStatusChangedEvent) => {
    onBatchEvent("BatchStatusChanged", data);
  });
  connection.on("InspectionCompleted", (data: BatchStatusChangedEvent) => {
    onBatchEvent("InspectionCompleted", data);
  });

  const onInventoryEvent = (eventName: string, data: InventoryAlertEvent) => {
    pushLog(eventName, data);
    inventoryHandlers.forEach((fn) => fn(data));
  };
  connection.on("InventoryAlert", (data: InventoryAlertEvent) => {
    onInventoryEvent("InventoryAlert", data);
  });
  connection.on("LowStockAlert", (data: InventoryAlertEvent) => {
    onInventoryEvent("LowStockAlert", data);
  });

  const onRequestEvent = (
    eventName: string,
    data: ProductRequestEvent,
    listeners: Set<Handler<ProductRequestEvent>>,
  ) => {
    pushLog(eventName, data);
    listeners.forEach((fn) => fn(data));
  };
  connection.on("RequestCreated", (data: ProductRequestEvent) =>
    onRequestEvent("RequestCreated", data, requestCreatedHandlers),
  );
  connection.on("BranchRequestCreated", (data: ProductRequestEvent) =>
    onRequestEvent("BranchRequestCreated", data, requestCreatedHandlers),
  );
  connection.on("RequestApproved", (data: ProductRequestEvent) =>
    onRequestEvent("RequestApproved", data, requestApprovedHandlers),
  );
  connection.on("BranchRequestApproved", (data: ProductRequestEvent) =>
    onRequestEvent("BranchRequestApproved", data, requestApprovedHandlers),
  );
  connection.on("RequestRejected", (data: ProductRequestEvent) =>
    onRequestEvent("RequestRejected", data, requestRejectedHandlers),
  );
  connection.on("DeliveryScheduled", (data: ProductRequestEvent) =>
    onRequestEvent("DeliveryScheduled", data, deliveryScheduledHandlers),
  );
  connection.on("TransferScheduled", (data: ProductRequestEvent) =>
    onRequestEvent("TransferScheduled", data, deliveryScheduledHandlers),
  );
  connection.on("Delivered", (data: ProductRequestEvent) =>
    onRequestEvent("Delivered", data, deliveredHandlers),
  );
  connection.on("TransferDelivered", (data: ProductRequestEvent) =>
    onRequestEvent("TransferDelivered", data, deliveredHandlers),
  );

  connection.on("BackorderCreated", (data: ProductRequestEvent) => {
    pushLog("BackorderCreated", data);
    backorderHandlers.forEach((fn) => fn(data));
  });

  connection.on("BudgetSubmitted", (data: BudgetEvent) => {
    pushLog("BudgetSubmitted", data);
    budgetSubmittedHandlers.forEach((fn) => fn(data));
  });

  connection.on("BudgetApproved", (data: BudgetEvent) => {
    pushLog("BudgetApproved", data);
    budgetApprovedHandlers.forEach((fn) => fn(data));
  });

  connection.on("ProductReleased", (data: ProductReleasedEvent) => {
    pushLog("ProductReleased", data);
    productReleasedHandlers.forEach((fn) => fn(data));
  });

  connection.onreconnecting(() => notifyState(HubConnectionState.Reconnecting));
  connection.onreconnected(() => notifyState(HubConnectionState.Connected));
  connection.onclose(() => notifyState(HubConnectionState.Disconnected));

  return connection;
}

// opens the SignalR connection, sends the JWT so the backend knows who we are
export async function startRealtime(): Promise<void> {
  const token = getToken();
  if (!token) {
    return;
  }
  if (Date.now() < authRetryBlockedUntil) {
    return;
  }

  if (stopPromise) {
    await stopPromise.catch(() => undefined);
  }

  const conn = ensureConnection();
  if (conn.state === HubConnectionState.Connected) return;
  if (startPromise) return startPromise;

  startPromise = (async () => {
    try {
      if (conn.state === HubConnectionState.Disconnected) {
        await conn.start();
        notifyState(HubConnectionState.Connected);
        return;
      }

      // Another start/reconnect is in progress. Wait until stable.
      while (
        conn.state === HubConnectionState.Connecting
        || conn.state === HubConnectionState.Reconnecting
      ) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (conn.state !== HubConnectionState.Connected) {
        await conn.start();
        notifyState(HubConnectionState.Connected);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        // Avoid endless 401 reconnect loops when token is expired.
        authRetryBlockedUntil = Date.now() + 30_000;
        showSessionExpiredToast();
        notifyState(HubConnectionState.Disconnected);
        return;
      }
      throw error;
    }
  })();

  try {
    await startPromise;
  } finally {
    startPromise = null;
  }
}

// close the connection (called on logout)
export async function stopRealtime(): Promise<void> {
  if (!connection) return;
  if (stopPromise) return stopPromise;

  const conn = connection;
  stopPromise = (async () => {
    // Avoid "stopped during negotiation" by waiting for start to settle first.
    if (startPromise) {
      await startPromise.catch(() => undefined);
    }
    if (conn.state !== HubConnectionState.Disconnected) {
      await conn.stop();
    }
    if (connection === conn) {
      connection = null;
    }
    notifyState(HubConnectionState.Disconnected);
  })();

  try {
    await stopPromise;
  } finally {
    stopPromise = null;
  }
}
