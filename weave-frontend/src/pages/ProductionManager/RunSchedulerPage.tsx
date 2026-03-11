import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import {
  hydrateRunSchedules,
  loadRunSchedules,
  persistRunSchedulesToBackend,
  saveRunSchedules,
  type RunScheduleRecord,
} from "../../lib/runScheduleStorage";
import { productsApi, type Product } from "../../lib/api/productsApi";

const defaultSizes = ["S", "M", "L", "XL", "XXL"];

const parseSizeKeys = (sizeProfile: string): string[] => {
  const raw = String(sizeProfile ?? "").trim();
  if (!raw.startsWith("{")) return defaultSizes;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return defaultSizes;
    const keys = Object.keys(parsed).filter(Boolean);
    return keys.length > 0 ? keys : defaultSizes;
  } catch {
    return defaultSizes;
  }
};

const buildEvenSizePlan = (plannedQty: number, sizeKeys: string[]): Record<string, number> => {
  const keys = sizeKeys.length > 0 ? sizeKeys : defaultSizes;
  const safeQty = Math.max(0, plannedQty);
  const base = Math.floor(safeQty / keys.length);
  let remainder = safeQty % keys.length;
  const plan: Record<string, number> = {};
  keys.forEach((key) => {
    const extra = remainder > 0 ? 1 : 0;
    plan[key] = base + extra;
    if (remainder > 0) remainder -= 1;
  });
  return plan;
};

const isReadyForRunStatus = (status: RunScheduleRecord["status"]) =>
  status === "Schedule Ready";

const getRunStatusLabel = (status: RunScheduleRecord["status"]) =>
  isReadyForRunStatus(status) ? "Ready for run" : status;

export default function RunSchedulerPage() {
  const [schedules, setSchedules] = useState<RunScheduleRecord[]>(() => loadRunSchedules());
  const [selected, setSelected] = useState<RunScheduleRecord | null>(null);
  const [detailViewRow, setDetailViewRow] = useState<RunScheduleRecord | null>(null);
  const [productsById, setProductsById] = useState<Record<number, Product>>({});
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | { type: "saveSchedule" } | { type: "advanceRun"; item: RunScheduleRecord }>(null);
  const [toastState, setToastState] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lineTeam, setLineTeam] = useState("");
  const [ownerAssignment, setOwnerAssignment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sizePlan, setSizePlan] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const syncSchedules = () => setSchedules(loadRunSchedules());
    window.addEventListener("focus", syncSchedules);
    window.addEventListener("storage", syncSchedules);
    hydrateRunSchedules().then(setSchedules).catch(() => undefined);
    productsApi
      .list()
      .then((products) => {
        const mapped: Record<number, Product> = {};
        products.forEach((item) => {
          mapped[item.ProductID] = item;
        });
        setProductsById(mapped);
      })
      .catch(() => undefined);
    const pollId = window.setInterval(() => {
      hydrateRunSchedules().then(setSchedules).catch(() => undefined);
    }, 2500);
    return () => {
      window.removeEventListener("focus", syncSchedules);
      window.removeEventListener("storage", syncSchedules);
      window.clearInterval(pollId);
    };
  }, []);

  const forSchedulingRows = useMemo(
    () => schedules.filter((item) => item.status === "For Scheduling"),
    [schedules],
  );
  const scheduledRuns = useMemo(
    () => schedules.filter((item) => item.status === "Schedule Ready" || item.status === "Run Candidate"),
    [schedules],
  );

  const upsertSchedules = (next: RunScheduleRecord[]) => {
    setSchedules(next);
    saveRunSchedules(next);
    void persistRunSchedulesToBackend(next);
  };

  const openScheduleModal = (item: RunScheduleRecord) => {
    setSelected(item);
    setLineTeam(item.lineTeam || "Line 1 - Team A");
    setOwnerAssignment(item.ownerAssignment || "line-a-supervisor");
    setStartDate(item.startDate || "");
    setEndDate(item.endDate || "");
    const product = productsById[item.productId];
    const sizeKeys = parseSizeKeys(product?.SizeProfile ?? "");
    const fallbackPlan = Object.fromEntries(
      sizeKeys.map((size) => [size, Math.max(0, Math.floor(item.plannedQty / sizeKeys.length))]),
    );
    setSizePlan(Object.keys(item.sizePlan ?? {}).length > 0 ? item.sizePlan : fallbackPlan);
    setFormError("");
    setIsScheduleModalOpen(true);
  };

  const sizeMismatch = useMemo(() => {
    if (!selected) return null;
    const total = Object.values(sizePlan).reduce((sum, qty) => sum + Math.max(0, Number(qty) || 0), 0);
    const expected = selected.plannedQty;
    return expected !== total ? { expected, actual: total } : null;
  }, [selected, sizePlan]);

  const saveSchedule = () => {
    if (!selected || !lineTeam || !ownerAssignment || !startDate || !endDate) return;
    if (sizeMismatch) {
      setFormError("Size total must exactly match planned quantity.");
      return;
    }
    setFormError("");

    const next: RunScheduleRecord[] = schedules.map((item) =>
      item.key === selected.key
        ? {
            ...item,
            lineTeam,
            ownerAssignment,
            startDate,
            endDate,
            status: "Schedule Ready" as const,
            source: "Scheduler" as const,
            sizePlan,
          }
        : item,
    );

    upsertSchedules(next);
    setIsScheduleModalOpen(false);
    setSelected(null);
    setToastState({ type: "success", message: "Run schedule added successfully." });
  };

  const advanceRunStatus = (item: RunScheduleRecord) => {
    const nextStatus: RunScheduleRecord["status"] =
      item.status === "Schedule Ready"
        ? "Run Candidate"
        : item.status === "Run Candidate"
          ? "Finished Run"
          : item.status;

    const next: RunScheduleRecord[] = schedules.map((row) =>
      row.key === item.key ? { ...row, status: nextStatus } : row,
    );
    upsertSchedules(next);
    setToastState({
      type: "success",
      message: nextStatus === "Finished Run" ? "Run marked as finished." : "Run moved to candidate stage.",
    });
  };

  const product = selected ? productsById[selected.productId] : null;
  const sizeKeys = parseSizeKeys(product?.SizeProfile ?? "");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Run Scheduler</h1>
            <p className="mt-1 text-sm text-slate-500">
              Schedule products marked For Scheduling and manage production lifecycle per product.
            </p>
          </div>
          <StatusBadge status="Operational" />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Scheduling Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          All schedule records must define line team, owner, date window, and exact size quantity distribution.
        </p>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">For Scheduling</CardTitle>
          <CardDescription>Products moved from Pending with status For Scheduling.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Run Code</TableHead>
                <TableHead>Planned Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forSchedulingRows.map((item) => (
                <TableRow key={item.key}>
                  <TableCell>{item.collectionCode}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.productSKU}</p>
                  </TableCell>
                  <TableCell>{item.runCode}</TableCell>
                  <TableCell>{item.plannedQty.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setDetailViewRow(item)}
                        aria-label={`View details for ${item.runCode}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Eye size={14} />
                      </button>
                      <PrimaryButton
                        className="!h-9 !w-auto !rounded-full !bg-emerald-600 !px-4 !py-2 !text-xs hover:!bg-emerald-700"
                        onClick={() => openScheduleModal(item)}
                      >
                        Add Schedule
                      </PrimaryButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {forSchedulingRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm text-slate-500">
                    No products are waiting for scheduling.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Scheduled Runs</CardTitle>
          <CardDescription>Only products with status Ready for run.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run Code</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Run Schedule</TableHead>
                <TableHead>Planned Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledRuns.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium text-slate-800">{item.runCode}</TableCell>
                  <TableCell>{item.collectionCode}</TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-800">{item.productName}</p>
                    <p className="text-xs text-slate-500">{item.productSKU}</p>
                  </TableCell>
                  <TableCell>
                    {item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : "-"}
                  </TableCell>
                  <TableCell>{item.plannedQty.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={getRunStatusLabel(item.status)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setDetailViewRow(item)}
                        aria-label={`View details for ${item.runCode}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Eye size={14} />
                      </button>
                      {isReadyForRunStatus(item.status) && (
                        <SecondaryButton
                          className="!h-9 !w-auto !rounded-full !px-4 !py-2 !text-xs"
                          onClick={() => setPendingAction({ type: "advanceRun", item })}
                        >
                          Run Schedule
                        </SecondaryButton>
                      )}
                      {item.status === "Run Candidate" && (
                        <PrimaryButton
                          className="!h-9 !w-auto !rounded-full !bg-emerald-600 !px-4 !py-2 !text-xs hover:!bg-emerald-700"
                          onClick={() => setPendingAction({ type: "advanceRun", item })}
                        >
                          Finish Run
                        </PrimaryButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {scheduledRuns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-slate-500">
                    No products with status Ready for run.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={isScheduleModalOpen && !!selected}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setFormError("");
        }}
        title="Run Scheduling Form"
        itemId={selected?.runCode ?? ""}
        headerIcon={<CalendarClock size={18} className="text-indigo-600" />}
        gridFields={[
          { label: "Collection", value: selected?.collectionCode ?? "-", icon: CalendarClock },
          { label: "Product", value: selected ? `${selected.productName} (${selected.productSKU})` : "-", icon: Package },
        ]}
        footerActions={
          <PrimaryButton
            className="!h-10 !w-auto !rounded-xl !bg-emerald-600 !px-4 !py-2 text-xs hover:!bg-emerald-700"
            onClick={() => setPendingAction({ type: "saveSchedule" })}
            disabled={!!sizeMismatch}
          >
            Add Schedule
          </PrimaryButton>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Run Code</Label>
            <Input value={selected?.runCode ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Planned Quantity</Label>
            <Input value={String(selected?.plannedQty ?? "")} disabled />
          </div>
          <div className="space-y-2">
            <Label>Line / Team Assignment</Label>
            <Input value={lineTeam} onChange={(e) => setLineTeam(e.target.value)} placeholder="Line 1 - Team A" />
          </div>
          <div className="space-y-2">
            <Label>Owner Assignment</Label>
            <Input value={ownerAssignment} onChange={(e) => setOwnerAssignment(e.target.value)} placeholder="line-a-supervisor" />
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product Size Breakdown</p>
              <SecondaryButton
                className="!h-8 !w-auto !rounded-full !px-3 !py-1 text-[11px]"
                onClick={() => setSizePlan(buildEvenSizePlan(selected?.plannedQty ?? 0, sizeKeys))}
              >
                Auto Distribute
              </SecondaryButton>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {sizeKeys.map((size) => (
                <div key={size} className="space-y-1">
                  <Label>{size}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={String(sizePlan[size] ?? 0)}
                    onChange={(e) =>
                      setSizePlan((prev) => ({
                        ...prev,
                        [size]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            {sizeMismatch ? (
              <p className="mt-2 text-xs text-rose-600">
                Size total mismatch: expected {sizeMismatch.expected.toLocaleString()}, got{" "}
                {sizeMismatch.actual.toLocaleString()}.
              </p>
            ) : (
              <p className="mt-2 text-xs text-emerald-700">Size total matches planned quantity.</p>
            )}
          </div>
          {formError ? <p className="sm:col-span-2 text-xs text-rose-600">{formError}</p> : null}
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={!!detailViewRow}
        onClose={() => setDetailViewRow(null)}
        title="Run Schedule Details"
        itemId={detailViewRow?.runCode ?? ""}
        headerIcon={<Package size={18} className="text-indigo-600" />}
        gridFields={[
          { label: "Collection", value: detailViewRow?.collectionCode ?? "-", icon: Package },
          {
            label: "Product",
            value: detailViewRow ? `${detailViewRow.productName} (${detailViewRow.productSKU})` : "-",
            icon: Package,
          },
          { label: "Run Code", value: detailViewRow?.runCode ?? "-", icon: CalendarClock },
          {
            label: "Status",
            value: detailViewRow ? <StatusBadge status={getRunStatusLabel(detailViewRow.status)} /> : "-",
            icon: CalendarClock,
          },
          {
            label: "Date Window",
            value: detailViewRow?.startDate && detailViewRow?.endDate ? `${detailViewRow.startDate} - ${detailViewRow.endDate}` : "-",
            icon: CalendarClock,
          },
          {
            label: "Planned Qty",
            value: detailViewRow ? detailViewRow.plannedQty.toLocaleString() : "-",
            icon: Package,
          },
        ]}
      >
        {detailViewRow ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ownership</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Line Team</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{detailViewRow.lineTeam || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Owner Assignment</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{detailViewRow.ownerAssignment || "-"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DetailsModal>

      <ConfirmationModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          try {
            if (!pendingAction) return;
            if (pendingAction.type === "saveSchedule") {
              saveSchedule();
            } else {
              advanceRunStatus(pendingAction.item);
            }
            setPendingAction(null);
          } catch {
            setToastState({ type: "error", message: "Unable to complete this action. Please try again." });
            setPendingAction(null);
          }
        }}
        title={pendingAction?.type === "saveSchedule" ? "Confirm Schedule Submission" : "Confirm Run Status Update"}
        message={
          pendingAction?.type === "saveSchedule"
            ? "This will save the run schedule and move it to Ready for run."
            : pendingAction?.item.status === "Run Candidate"
              ? "This will mark the run as finished."
              : "This will move this run to candidate stage."
        }
        confirmText={pendingAction?.type === "saveSchedule" ? "Save Schedule" : "Continue"}
        cancelText="Cancel"
        variant="primary"
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
