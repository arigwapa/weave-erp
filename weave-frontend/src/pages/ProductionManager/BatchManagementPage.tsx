import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Eye,
  Factory,
  ListChecks,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { StatusBadge } from "../../components/ui/StatusBadge";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import TabBar from "../../components/ui/TabBar";
import {
  hydrateBatches,
  listBatchCandidates,
  loadBatches,
  persistBatchesToBackend,
  saveBatches,
  type BatchCandidate,
  type BatchRecord,
  type BatchStatus,
} from "../../lib/batchStorage";
import { loadRunSchedules, persistRunSchedulesToBackend, saveRunSchedules } from "../../lib/runScheduleStorage";
import { productsApi } from "../../lib/api/productsApi";

type BatchBoardTab = "Unpacked";
const FIXED_SIZE_RANGE = "S/M/L/XL/XXL";

export default function BatchManagementPage() {
  const [candidates, setCandidates] = useState<BatchCandidate[]>([]);
  const [selectedScheduleKey, setSelectedScheduleKey] = useState("");
  const [size, setSize] = useState(FIXED_SIZE_RANGE);
  const [qty, setQty] = useState("");
  const [batches, setBatches] = useState<BatchRecord[]>(() => loadBatches());
  const [statusTab, setStatusTab] = useState<BatchBoardTab>("Unpacked");
  const batchStatusBoardRef = useRef<HTMLDivElement | null>(null);
  const [productNameById, setProductNameById] = useState<Record<number, string>>({});
  const [isCandidateDetailsOpen, setIsCandidateDetailsOpen] = useState(false);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<BatchRecord | null>(null);
  const [pendingAction, setPendingAction] = useState<null | { type: "createBatch" } | { type: "sendToQa"; code: string }>(null);
  const [toastState, setToastState] = useState<null | { type: "success" | "error"; message: string }>(null);

  const selectedCandidate = useMemo(
    () => candidates.find((item) => item.scheduleKey === selectedScheduleKey) ?? null,
    [candidates, selectedScheduleKey],
  );

  const sizeOptions = useMemo(
    () =>
      Object.entries(selectedCandidate?.sizePlan ?? {})
        .filter(([, value]) => value > 0)
        .sort((a, b) => a[0].localeCompare(b[0])),
    [selectedCandidate],
  );

  const nextBatchCode = useMemo(() => {
    const maxSuffix = batches.reduce((max, item) => {
      const code = String(item.code ?? "").trim();
      const matched = code.match(/-(\d+)$/);
      const value = matched ? Number(matched[1]) : 0;
      return Number.isNaN(value) ? max : Math.max(max, value);
    }, 0);
    return `BAT-2603-${String(maxSuffix + 1).padStart(2, "0")}`;
  }, [batches]);

  const inProgressCount = useMemo(
    () => batches.filter((item) => item.status === "In Progress").length,
    [batches],
  );
  const sentToQaCount = useMemo(
    () =>
      batches.filter(
        (item) =>
          item.status === "For Inspection" ||
          item.status === "Submitted" ||
          item.status === "Approved" ||
          item.status === "Disapproved",
      ).length,
    [batches],
  );
  const totalQty = useMemo(
    () => batches.reduce((sum, item) => sum + item.qty, 0),
    [batches],
  );
  const statusTabs = useMemo(
    () => [
      {
        id: "Unpacked",
        label: "Unpacked",
        icon: ListChecks,
        count: batches.filter((item) => item.status === "Unpacked").length,
      },
    ],
    [batches],
  );

  const filteredBatches = useMemo(
    () => batches.filter((item) => item.status === "Unpacked"),
    [batches],
  );

  useEffect(() => {
    // BACKEND-TRACK: hydrate local state from backend when enabled.
    hydrateBatches().then(setBatches).catch(() => undefined);
  }, []);

  useEffect(() => {
    productsApi
      .list()
      .then((items) => {
        const mapped: Record<number, string> = {};
        items.forEach((item) => {
          if (Number.isFinite(item.ProductID) && item.ProductID > 0) {
            mapped[item.ProductID] = String(item.Name ?? "").trim();
          }
        });
        setProductNameById(mapped);
      })
      .catch(() => setProductNameById({}));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrateCandidates = async () => {
      const items = await listBatchCandidates();
      if (isMounted) {
        setCandidates(items);
      }
    };

    hydrateCandidates().catch(() => undefined);
    const intervalId = window.setInterval(() => {
      hydrateCandidates().catch(() => undefined);
    }, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (candidates.length === 0) {
      setSelectedScheduleKey("");
      return;
    }
    const hasSelected = candidates.some((item) => item.scheduleKey === selectedScheduleKey);
    if (!hasSelected) {
      setSelectedScheduleKey(candidates[0].scheduleKey);
    }
  }, [candidates, selectedScheduleKey]);

  useEffect(() => {
    if (!selectedCandidate) {
      setSize(FIXED_SIZE_RANGE);
      setQty("");
      return;
    }
    const nextSizeOptions = Object.entries(selectedCandidate.sizePlan).filter(([, value]) => value > 0);
    const nextQty = nextSizeOptions[0]?.[1] ?? selectedCandidate.plannedQty;
    setSize(FIXED_SIZE_RANGE);
    setQty(nextQty > 0 ? String(nextQty) : "1");
  }, [selectedCandidate]);

  useEffect(() => {
    saveBatches(batches);
    // BACKEND-TRACK: keep backend in sync without blocking UI actions.
    void persistBatchesToBackend(batches);
  }, [batches]);

  const createBatch = (): boolean => {
    if (!selectedCandidate || !size || !qty) return false;
    const parsedQty = Number(qty);
    if (Number.isNaN(parsedQty) || parsedQty <= 0) return false;
    const createdScheduleKey = selectedCandidate.scheduleKey;

    const nextItem: BatchRecord = {
      code: nextBatchCode,
      orderId: selectedCandidate.orderId,
      versionNumber: selectedCandidate.versionNumber,
      productId: selectedCandidate.productId,
      collectionId: selectedCandidate.collectionId,
      collectionCode: selectedCandidate.collectionCode,
      collectionName: selectedCandidate.collectionName,
      productSku: selectedCandidate.productSku,
      runCode: selectedCandidate.runCode,
      scheduleKey: selectedCandidate.scheduleKey,
      sourceStatus: selectedCandidate.sourceStatus,
      product: selectedCandidate.productName || selectedCandidate.productSku,
      version: selectedCandidate.versionNumber || "Unversioned",
      size,
      qty: parsedQty,
      status: "Unpacked",
    };

    setBatches((prev) => [nextItem, ...prev]);
    setCandidates((prev) => {
      const remaining = prev.filter((item) => item.scheduleKey !== createdScheduleKey);
      setSelectedScheduleKey(remaining[0]?.scheduleKey ?? "");
      return remaining;
    });
    setStatusTab("Unpacked");

    const nextSchedules = loadRunSchedules().map((item) =>
      item.key === selectedCandidate.scheduleKey
        ? { ...item, status: "Unpacked" as const }
        : item,
    );
    saveRunSchedules(nextSchedules);
    void persistRunSchedulesToBackend(nextSchedules);

    window.setTimeout(() => {
      batchStatusBoardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
    return true;
  };

  const updateBatchStatus = (code: string, nextStatus: BatchStatus) => {
    setBatches((prev) =>
      prev.map((item) => (item.code === code ? { ...item, status: nextStatus } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Batch Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and monitor production batches with issue logging and QA-ready status progression.
            </p>
          </div>
          <StatusBadge status="Operational" />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Batch creation should only proceed with approved version references and traceable issue categories.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Total Batches"
          value={String(batches.length)}
          icon={Boxes}
          colorTheme="indigo"
          trend="+2.3%"
          trendUp
          subText="Visible in current board"
        />
        <DashboardStatsCard
          title="In Progress"
          value={String(inProgressCount)}
          icon={Factory}
          colorTheme="blue"
          trend="+1.8%"
          trendUp
          subText="Active execution"
        />
        <DashboardStatsCard
          title="Sent to QA"
          value={String(sentToQaCount)}
          icon={ShieldCheck}
          colorTheme="emerald"
          trend="+0.9%"
          trendUp
          subText="Awaiting QA disposition"
        />
        <DashboardStatsCard
          title="Planned Quantity"
          value={totalQty.toLocaleString()}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="+3.1%"
          trendUp
          subText="Units across listed batches"
        />
      </section>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Batch Creation</CardTitle>
          <CardDescription>Create batches directly from Run Candidate items.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Batch Code</Label>
            <Input value={nextBatchCode} readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Run Candidate</Label>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700"
                onClick={() => setIsCandidateDetailsOpen(true)}
                disabled={!selectedCandidate}
              >
                <Eye size={12} />
                View Details
              </button>
            </div>
            <Select value={selectedScheduleKey} onValueChange={setSelectedScheduleKey}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select a production run" />
              </SelectTrigger>
              <SelectContent>
                {candidates.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No eligible runs
                  </SelectItem>
                ) : (
                  candidates.map((item) => (
                    <SelectItem key={item.scheduleKey} value={item.scheduleKey}>
                      {item.productName || item.productSku} - {item.productSku} - {item.runCode}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Order / Version</Label>
            <Input
              value={
                selectedCandidate
                  ? `Order #${selectedCandidate.orderId || "N/A"} / ${selectedCandidate.versionNumber || "N/A"}`
                  : ""
              }
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Run / Source Status</Label>
            <Input
              value={selectedCandidate ? `${selectedCandidate.runCode} / ${selectedCandidate.sourceStatus}` : ""}
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Input
              value={
                selectedCandidate
                  ? `${selectedCandidate.productSku} - ${selectedCandidate.productName || selectedCandidate.productSku}`
                  : ""
              }
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Size</Label>
            <Input value={FIXED_SIZE_RANGE} disabled readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Qty</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder={selectedCandidate ? String(selectedCandidate.plannedQty) : "0"}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Collection Trace</Label>
            <Input
              value={
                selectedCandidate
                  ? `${selectedCandidate.collectionCode} - ${selectedCandidate.collectionName}`
                  : ""
              }
              readOnly
              className="bg-slate-50"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <SecondaryButton
              onClick={() => {
                if (!selectedCandidate) {
                  setSize(FIXED_SIZE_RANGE);
                  setQty("");
                  return;
                }
                const options = Object.entries(selectedCandidate.sizePlan).filter(([, value]) => value > 0);
                setSize(FIXED_SIZE_RANGE);
                setQty(options[0]?.[1] ? String(options[0][1]) : String(selectedCandidate.plannedQty));
              }}
            >
              Reset
            </SecondaryButton>
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              onClick={() => setPendingAction({ type: "createBatch" })}
              disabled={!selectedCandidate || !size}
            >
              Create Batch
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm" ref={batchStatusBoardRef}>
        <CardHeader>
          <CardTitle className="text-base">Batch Status Board</CardTitle>
          <CardDescription>Shows only batches with status Unpacked.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <TabBar
              tabs={statusTabs}
              activeTab={statusTab}
              onTabChange={(id) => setStatusTab(id as BatchBoardTab)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Code</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Run Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-slate-500">
                    No batches found for this status.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell className="font-medium text-slate-800">{item.code}</TableCell>
                    <TableCell>{item.orderId > 0 ? item.orderId : "-"}</TableCell>
                    <TableCell>{item.versionNumber || item.version}</TableCell>
                    <TableCell>{item.runCode || "-"}</TableCell>
                    <TableCell>{productNameById[item.productId] || item.product || item.productSku || "-"}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.qty.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setSelectedBatchDetails(item)}
                          aria-label={`View details for ${item.code}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Eye size={14} />
                        </button>
                        {item.status === "Unpacked" ? (
                          <SecondaryButton
                            className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                            onClick={() => setPendingAction({ type: "sendToQa", code: item.code })}
                          >
                            Send to QA
                          </SecondaryButton>
                        ) : (
                          <span className="text-xs text-slate-500">Awaiting next production step</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Issue Logging</CardTitle>
          <CardDescription>Capture production blockers by category for batch-level visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Material shortage", "Open", "Raw fabric ETA pushed by supplier."],
            ["Machine issue", "In Progress", "Line 2 stitch machine calibration ongoing."],
            ["Manpower issue", "Planned", "Backup staffing shift prepared for weekend run."],
          ].map(([issue, status, detail]) => (
            <div
              key={String(issue)}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"
            >
              <div className="flex items-start gap-2">
                <Wrench size={14} className="mt-0.5 text-slate-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{issue}</p>
                  <p className="text-xs text-slate-500">{detail}</p>
                </div>
              </div>
              <StatusBadge status={String(status)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={isCandidateDetailsOpen && !!selectedCandidate}
        onClose={() => setIsCandidateDetailsOpen(false)}
        title="Run Candidate Details"
        itemId={selectedCandidate?.runCode ?? ""}
        headerIcon={<Package size={18} className="text-indigo-600" />}
        gridFields={[
          {
            label: "Collection",
            value: selectedCandidate ? `${selectedCandidate.collectionCode} (${selectedCandidate.collectionName})` : "-",
            icon: Boxes,
          },
          {
            label: "Product",
            value: selectedCandidate ? `${selectedCandidate.productSku} - ${selectedCandidate.productName}` : "-",
            icon: Package,
          },
          {
            label: "Order / Version",
            value: selectedCandidate ? `${selectedCandidate.orderId} / ${selectedCandidate.versionNumber || "N/A"}` : "-",
            icon: ListChecks,
          },
          {
            label: "Run / Source Status",
            value: selectedCandidate ? `${selectedCandidate.runCode} / ${selectedCandidate.sourceStatus}` : "-",
            icon: Factory,
          },
          {
            label: "Planned Qty",
            value: selectedCandidate ? selectedCandidate.plannedQty.toLocaleString() : "-",
            icon: AlertTriangle,
          },
          {
            label: "Size Options",
            value: sizeOptions.length > 0 ? sizeOptions.map(([label]) => label).join(", ") : "-",
            icon: ListChecks,
          },
        ]}
      />

      <DetailsModal
        isOpen={!!selectedBatchDetails}
        onClose={() => setSelectedBatchDetails(null)}
        title="Batch Details"
        itemId={selectedBatchDetails?.code ?? ""}
        headerIcon={<Boxes size={18} className="text-indigo-600" />}
        gridFields={[
          { label: "Batch Code", value: selectedBatchDetails?.code ?? "-", icon: Boxes },
          {
            label: "Collection",
            value: selectedBatchDetails
              ? `${selectedBatchDetails.collectionCode} (${selectedBatchDetails.collectionName})`
              : "-",
            icon: ListChecks,
          },
          {
            label: "Product",
            value: selectedBatchDetails
              ? productNameById[selectedBatchDetails.productId] || selectedBatchDetails.product || selectedBatchDetails.productSku
              : "-",
            icon: Package,
          },
          { label: "Run Code", value: selectedBatchDetails?.runCode || "-", icon: Factory },
          { label: "Size / Qty", value: selectedBatchDetails ? `${selectedBatchDetails.size} / ${selectedBatchDetails.qty}` : "-", icon: AlertTriangle },
          {
            label: "Status",
            value: selectedBatchDetails ? <StatusBadge status={selectedBatchDetails.status} /> : "-",
            icon: ShieldCheck,
          },
        ]}
        footerActions={
          selectedBatchDetails?.status === "Unpacked" ? (
            <SecondaryButton
              className="!w-auto !rounded-xl !px-4 !py-2 !text-xs"
              onClick={() => {
                setSelectedBatchDetails(null);
                setPendingAction({ type: "sendToQa", code: selectedBatchDetails.code });
              }}
            >
              Send to QA
            </SecondaryButton>
          ) : undefined
        }
      />

      <ConfirmationModal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          if (!pendingAction) return;
          if (pendingAction.type === "createBatch") {
            const created = createBatch();
            setToastState(
              created
                ? { type: "success", message: "Batch created successfully." }
                : { type: "error", message: "Unable to create batch. Complete all required fields." },
            );
            setPendingAction(null);
            return;
          }

          updateBatchStatus(pendingAction.code, "For Inspection");
          setToastState({ type: "success", message: `Batch ${pendingAction.code} sent to QA.` });
          setPendingAction(null);
        }}
        title={pendingAction?.type === "createBatch" ? "Confirm Batch Creation" : "Send Batch to QA?"}
        message={
          pendingAction?.type === "createBatch"
            ? "This will create a new batch from the selected run candidate and move it to the Unpacked board."
            : "This will submit the selected batch for quality inspection."
        }
        confirmText={pendingAction?.type === "createBatch" ? "Create Batch" : "Send to QA"}
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
