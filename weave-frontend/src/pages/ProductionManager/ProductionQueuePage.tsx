import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Factory,
  ListChecks,
  Package,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SecondaryButton from "../../components/ui/SecondaryButton";
import TabBar from "../../components/ui/TabBar";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { productionQueueApi, type ProductionQueueItem } from "../../lib/api/productionQueueApi";
import {
  buildScheduleKey,
  hydrateRunSchedules,
  loadRunSchedules,
  persistRunSchedulesToBackend,
  saveRunSchedules,
  type RunScheduleRecord,
} from "../../lib/runScheduleStorage";

type QueueStatus = "Pending" | "On Going" | "Completed";
type QueueLifecycleStatus = QueueStatus | "For Scheduling" | "Schedule Ready" | "Run Candidate" | "Unpacked" | "Finished Run";
type ProductQueueRow = {
  item: ProductionQueueItem;
  displayStatus: QueueLifecycleStatus;
  tabStatus: QueueStatus;
};

const buildProductRunCode = (collectionCode: string, productSKU: string) =>
  `RUN-${collectionCode}-${productSKU}`.replace(/\s+/g, "-").toUpperCase();

const resolveProductStatus = (
  product: ProductionQueueItem,
  schedule?: RunScheduleRecord,
): { displayStatus: QueueLifecycleStatus; tabStatus: QueueStatus } => {
  if (schedule) {
    if (schedule.status === "Finished Run") return { displayStatus: "Finished Run", tabStatus: "Completed" };
    if (schedule.status === "Unpacked") return { displayStatus: "Completed", tabStatus: "Completed" };
    if (schedule.status === "Run Candidate") return { displayStatus: "Run Candidate", tabStatus: "On Going" };
    if (schedule.status === "Schedule Ready") return { displayStatus: "Schedule Ready", tabStatus: "On Going" };
    return { displayStatus: "For Scheduling", tabStatus: "On Going" };
  }

  if (product.QueueStatus === "Completed") return { displayStatus: "Completed", tabStatus: "Completed" };
  if (product.QueueStatus === "On Going") return { displayStatus: "On Going", tabStatus: "On Going" };
  return { displayStatus: "Pending", tabStatus: "Pending" };
};

const isStrictPendingRow = (row: ProductQueueRow) =>
  row.tabStatus === "Pending" &&
  row.displayStatus.trim().toLowerCase() === "pending" &&
  String(row.item.QueueStatus ?? "").trim().toLowerCase() === "pending";

export default function ProductionQueuePage() {
  const [rows, setRows] = useState<ProductionQueueItem[]>([]);
  const [schedules, setSchedules] = useState<RunScheduleRecord[]>(() => loadRunSchedules());
  const [isLoading, setIsLoading] = useState(false);
  const [startingScheduleKey, setStartingScheduleKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QueueStatus>("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selected, setSelected] = useState<ProductQueueRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmStartOpen, setIsConfirmStartOpen] = useState(false);
  const [pendingStartRow, setPendingStartRow] = useState<ProductQueueRow | null>(null);
  const [toastState, setToastState] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await productionQueueApi.list();
        setRows(data);
      } catch {
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const syncSchedules = () => setSchedules(loadRunSchedules());
    window.addEventListener("focus", syncSchedules);
    window.addEventListener("storage", syncSchedules);
    hydrateRunSchedules().then(setSchedules).catch(() => undefined);
    const pollId = window.setInterval(() => {
      hydrateRunSchedules().then(setSchedules).catch(() => undefined);
    }, 2500);
    return () => {
      window.removeEventListener("focus", syncSchedules);
      window.removeEventListener("storage", syncSchedules);
      window.clearInterval(pollId);
    };
  }, []);

  const queueRows = useMemo<ProductQueueRow[]>(
    () => {
      const scheduleMap = new Map<string, RunScheduleRecord>(
        schedules.map((item) => [buildScheduleKey(item.collectionId, item.productId), item]),
      );
      return rows.map((product) => {
        const linkedSchedule = scheduleMap.get(buildScheduleKey(product.CollectionID, product.ProductID));
        const statusInfo = resolveProductStatus(product, linkedSchedule);
        return {
          item: product,
          displayStatus: statusInfo.displayStatus,
          tabStatus: statusInfo.tabStatus,
        };
      });
    },
    [rows, schedules],
  );

  const tabs = useMemo(
    () => [
      {
        id: "Pending",
        label: "Pending",
        icon: Clock3,
        count: queueRows.filter((r) => isStrictPendingRow(r)).length,
      },
      {
        id: "On Going",
        label: "On Going",
        icon: Factory,
        count: queueRows.filter((r) => r.tabStatus === "On Going").length,
      },
      {
        id: "Completed",
        label: "Completed",
        icon: CheckCircle2,
        count: queueRows.filter((r) => r.tabStatus === "Completed").length,
      },
    ],
    [queueRows],
  );

  const filteredRows = useMemo(
    () =>
      queueRows.filter((row) => {
        const inTab = activeTab === "Pending"
          ? isStrictPendingRow(row)
          : row.tabStatus === activeTab;
        const q = searchQuery.trim().toLowerCase();
        const inSearch =
          !q ||
          String(row.item.OrderID).includes(q) ||
          String(row.item.VersionNumber ?? row.item.CurrentVersionNumber ?? row.item.SuggestedVersionNumber ?? "").toLowerCase().includes(q) ||
          row.item.CollectionCode.toLowerCase().includes(q) ||
          row.item.CollectionName.toLowerCase().includes(q) ||
          row.item.ProductSKU.toLowerCase().includes(q) ||
          row.item.ProductName.toLowerCase().includes(q) ||
          row.displayStatus.toLowerCase().includes(q);
        return inTab && inSearch;
      }),
    [queueRows, activeTab, searchQuery],
  );

  const openDetails = (row: ProductQueueRow) => {
    setSelected(row);
    setIsDetailsOpen(true);
  };

  const requestStart = (row: ProductQueueRow) => {
    setPendingStartRow(row);
    setIsConfirmStartOpen(true);
  };

  const addSchedule = async (row: ProductQueueRow) => {
    const product = row.item;
    const scheduleKey = buildScheduleKey(product.CollectionID, product.ProductID);
    if (startingScheduleKey === scheduleKey) return;
    setStartingScheduleKey(scheduleKey);
    const runCode = buildProductRunCode(product.CollectionCode, product.ProductSKU);
    const nextItem: RunScheduleRecord = {
      key: scheduleKey,
      collectionId: product.CollectionID,
      productId: product.ProductID,
      collectionCode: product.CollectionCode,
      collectionName: product.CollectionName,
      productSKU: product.ProductSKU,
      productName: product.ProductName,
      runCode,
      lineTeam: "",
      ownerAssignment: "",
      startDate: "",
      endDate: "",
      plannedQty: Math.max(1, product.PlannedQty),
      status: "For Scheduling" as const,
      source: "Queue",
      linkedVersion: product.CurrentVersionNumber || product.SuggestedVersionNumber || undefined,
      sizePlan: {},
    };

    try {
      await productionQueueApi.startRun({
        OrderID: product.OrderID,
        CollectionID: product.CollectionID,
        ProductID: product.ProductID,
        VersionNumber: product.VersionNumber ?? product.CurrentVersionNumber ?? product.SuggestedVersionNumber ?? "Version 1",
      });

      const latestSchedules = loadRunSchedules();
      const byKey = new Map<string, RunScheduleRecord>(latestSchedules.map((item) => [item.key, item]));
      const existing = byKey.get(nextItem.key);
      byKey.set(nextItem.key, existing ? { ...existing, ...nextItem, status: "For Scheduling" as const } : nextItem);
      const updatedSchedules = Array.from(byKey.values());

      setSchedules(updatedSchedules);
      saveRunSchedules(updatedSchedules);
      void persistRunSchedulesToBackend(updatedSchedules);

      const refreshedQueue = await productionQueueApi.list();
      setRows(refreshedQueue);
      setActiveTab("On Going");
    } finally {
      setStartingScheduleKey(null);
    }
  };

  const confirmStart = async () => {
    if (!pendingStartRow) return;
    try {
      await addSchedule(pendingStartRow);
      setToastState({
        type: "success",
        message: `Run started for ${pendingStartRow.item.ProductSKU}. You can continue scheduling in Run Scheduler.`,
      });
      setIsConfirmStartOpen(false);
      setPendingStartRow(null);
    } catch {
      setToastState({
        type: "error",
        message: `Unable to start run for ${pendingStartRow.item.ProductSKU}. Please try again.`,
      });
      setIsConfirmStartOpen(false);
      setPendingStartRow(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Production Queue</h1>
            <p className="mt-1 text-sm text-slate-500">
              Admin-approved products are listed here for production run initiation, with collection as inventory linkage.
            </p>
          </div>
          <StatusBadge status="Operational" />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Product-Based Workflow</p>
        <p className="mt-1 text-sm text-sky-900">
          Each product runs independently. Collection is kept as FK for inventory traceability.
        </p>
      </div>

      <div className="flex justify-start">
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as QueueStatus)} />
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Approved Product Production Queue</CardTitle>
          <CardDescription>Each row represents one product ready for production.</CardDescription>
        </CardHeader>
        <CardContent>
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            placeholder="Search collection, product, SKU, or status..."
            filterLabel="Queue Filter"
          >
            <div className="p-3 text-xs text-slate-500">Use tabs to switch run stages.</div>
          </TableToolbar>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>OrderID</TableHead>
                <TableHead>VersionNumber</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={`${row.item.OrderID}-${row.item.CollectionID}-${row.item.ProductID}`}>
                  <TableCell className="font-medium text-slate-800">{row.item.OrderID}</TableCell>
                  <TableCell>{row.item.VersionNumber ?? row.item.CurrentVersionNumber ?? row.item.SuggestedVersionNumber ?? "-"}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-800">{row.item.CollectionCode}</p>
                    <p className="text-xs text-slate-500">{row.item.CollectionName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-800">
                      {row.item.ProductName}
                    </p>
                    <p className="text-xs text-slate-500">SKU: {row.item.ProductSKU} | Qty: {Math.max(1, row.item.PlannedQty).toLocaleString()}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.displayStatus} />
                  </TableCell>
                  <TableCell>{row.item.DueDate}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-start gap-2">
                      <button
                        onClick={() => openDetails(row)}
                        aria-label={`View details for ${row.item.ProductSKU}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Eye size={14} />
                      </button>
                      {row.tabStatus === "Pending" && (
                        <SecondaryButton
                          className="!h-9 !w-auto !rounded-full !px-4 !py-2 !text-xs"
                          disabled={startingScheduleKey === buildScheduleKey(row.item.CollectionID, row.item.ProductID)}
                          onClick={() => requestStart(row)}
                        >
                          {startingScheduleKey === buildScheduleKey(row.item.CollectionID, row.item.ProductID)
                            ? "Starting..."
                            : "Start Run"}
                        </SecondaryButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    {isLoading
                      ? "Loading production queue..."
                      : activeTab === "Pending"
                        ? "No pending products. Check the On Going tab for started products."
                        : "No admin-approved products are ready for this tab/filter."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={isDetailsOpen && !!selected}
        onClose={() => setIsDetailsOpen(false)}
        title="Product Queue Details"
        itemId={selected?.item.ProductSKU ?? ""}
        headerIcon={<Package size={18} className="text-indigo-600" />}
        gridFields={[
          {
            label: "Collection",
            value: `${selected?.item.CollectionName ?? "-"} (${selected?.item.CollectionCode ?? "-"})`,
            icon: ListChecks,
          },
          {
            label: "Order / Version",
            value: selected
              ? `${selected.item.OrderID} / ${selected.item.VersionNumber ?? selected.item.CurrentVersionNumber ?? selected.item.SuggestedVersionNumber ?? "-"}`
              : "-",
            icon: ListChecks,
          },
          {
            label: "Product",
            value: selected ? `${selected.item.ProductName} (${selected.item.ProductSKU})` : "-",
            icon: Package,
          },
          { label: "Version", value: selected?.item.CurrentVersionNumber || "Version 1", icon: ShieldCheck },
          { label: "Queue Status", value: selected ? <StatusBadge status={selected.displayStatus} /> : "-", icon: Factory },
          { label: "Budget", value: selected ? `PHP ${selected.item.ApprovedBudget.toLocaleString()}` : "-", icon: CheckCircle2 },
          { label: "Planned Qty", value: selected ? Math.max(1, selected.item.PlannedQty).toLocaleString() : "-", icon: CheckCircle2 },
        ]}
        footerActions={
          selected && selected.tabStatus === "Pending" ? (
            <div className="flex items-center gap-2">
              <SecondaryButton
                className="!h-10 !rounded-xl !px-4 !py-2 text-xs"
                onClick={() => {
                  setIsDetailsOpen(false);
                  requestStart(selected);
                }}
              >
                Start Run
              </SecondaryButton>
            </div>
          ) : undefined
        }
      >
        {selected ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Readiness Notes</p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              {selected.item.Readiness || "No readiness note available."}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selected.item.DueDate || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Budget Code</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{selected.item.BudgetCode || "-"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DetailsModal>

      <ConfirmationModal
        isOpen={isConfirmStartOpen && !!pendingStartRow}
        onClose={() => {
          setIsConfirmStartOpen(false);
          setPendingStartRow(null);
        }}
        onConfirm={() => void confirmStart()}
        title="Start Production Run?"
        message={
          pendingStartRow
            ? `This will move ${pendingStartRow.item.ProductName} (${pendingStartRow.item.ProductSKU}) to the active production workflow.`
            : "Confirm production start."
        }
        variant="primary"
        confirmText="Start Run"
        cancelText="Cancel"
      />

      {toastState ? (
        <Toast
          type={toastState.type}
          message={toastState.message}
          onClose={() => setToastState(null)}
        />
      ) : null}
    </div>
  );
}
