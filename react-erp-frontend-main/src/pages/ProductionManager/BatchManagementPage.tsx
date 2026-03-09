import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  Factory,
  ListChecks,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import TabBar from "../../components/ui/TabBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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

type BatchBoardTab = "All" | "In Progress" | "Completed" | "Sent to QA";

export default function BatchManagementPage() {
  const [candidates, setCandidates] = useState<BatchCandidate[]>([]);
  const [selectedScheduleKey, setSelectedScheduleKey] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState("");
  const [batches, setBatches] = useState<BatchRecord[]>(() => loadBatches());
  const [statusTab, setStatusTab] = useState<BatchBoardTab>("All");

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
        (item) => item.status === "Submitted" || item.status === "Approved" || item.status === "Disapproved",
      ).length,
    [batches],
  );
  const totalQty = useMemo(
    () => batches.reduce((sum, item) => sum + item.qty, 0),
    [batches],
  );
  const statusTabs = useMemo(
    () => [
      { id: "All", label: "All", icon: ListChecks, count: batches.length },
      {
        id: "In Progress",
        label: "In Progress",
        icon: Factory,
        count: batches.filter((item) => item.status === "In Progress").length,
      },
      {
        id: "Completed",
        label: "Completed",
        icon: CheckCircle2,
        count: batches.filter((item) => item.status === "Completed").length,
      },
      {
        id: "Sent to QA",
        label: "Sent to QA",
        icon: Clock3,
        count: batches.filter((item) =>
          item.status === "Submitted" || item.status === "Approved" || item.status === "Disapproved"
        ).length,
      },
    ],
    [batches],
  );

  const filteredBatches = useMemo(
    () =>
      statusTab === "All"
        ? batches
        : statusTab === "Sent to QA"
          ? batches.filter(
              (item) =>
                item.status === "Submitted" || item.status === "Approved" || item.status === "Disapproved",
            )
          : batches.filter((item) => item.status === statusTab),
    [batches, statusTab],
  );

  useEffect(() => {
    // BACKEND-TRACK: hydrate local state from backend when enabled.
    hydrateBatches().then(setBatches).catch(() => undefined);
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
      setSize("");
      setQty("");
      return;
    }
    const nextSizeOptions = Object.entries(selectedCandidate.sizePlan).filter(([, value]) => value > 0);
    const nextSize = nextSizeOptions[0]?.[0] ?? "";
    const nextQty = nextSizeOptions[0]?.[1] ?? selectedCandidate.plannedQty;
    setSize(nextSize);
    setQty(nextQty > 0 ? String(nextQty) : "1");
  }, [selectedCandidate]);

  useEffect(() => {
    if (!selectedCandidate || !size) return;
    const preferredQty = selectedCandidate.sizePlan[size];
    if (preferredQty > 0) {
      setQty(String(preferredQty));
    }
  }, [selectedCandidate, size]);

  useEffect(() => {
    saveBatches(batches);
    // BACKEND-TRACK: keep backend in sync without blocking UI actions.
    void persistBatchesToBackend(batches);
  }, [batches]);

  const createBatch = () => {
    if (!selectedCandidate || !size || !qty) return;
    const parsedQty = Number(qty);
    if (Number.isNaN(parsedQty) || parsedQty <= 0) return;

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
      status: "In Progress",
    };

    setBatches((prev) => [nextItem, ...prev]);
  };

  const updateBatchStatus = (code: string, nextStatus: BatchStatus) => {
    setBatches((prev) =>
      prev.map((item) => (item.code === code ? { ...item, status: nextStatus } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Batch Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and monitor production batches with issue logging and QA-ready status progression.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
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

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Batch Creation</CardTitle>
          <CardDescription>Create batches directly from Schedule Running or Finished Run items.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Batch Code</Label>
            <Input value={nextBatchCode} readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Run Candidate</Label>
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
                      {item.collectionCode} - {item.productSku} - {item.runCode}
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
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {sizeOptions.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No sizes available
                  </SelectItem>
                ) : (
                  sizeOptions.map(([label, planned]) => (
                    <SelectItem key={label} value={label}>
                      {label} (planned {planned})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
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
                  setSize("");
                  setQty("");
                  return;
                }
                const options = Object.entries(selectedCandidate.sizePlan).filter(([, value]) => value > 0);
                setSize(options[0]?.[0] ?? "");
                setQty(options[0]?.[1] ? String(options[0][1]) : String(selectedCandidate.plannedQty));
              }}
            >
              Reset
            </SecondaryButton>
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              onClick={createBatch}
              disabled={!selectedCandidate || !size}
            >
              Create Batch
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Batch Status Board</CardTitle>
          <CardDescription>Track in-progress, completed, and sent-to-QA states with production traceability.</CardDescription>
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
                <TableHead>Action</TableHead>
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
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.qty.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      {item.status === "In Progress" ? (
                        <PrimaryButton
                          className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                          onClick={() => updateBatchStatus(item.code, "Completed")}
                        >
                          Batch Completed
                        </PrimaryButton>
                      ) : item.status === "Completed" ? (
                        <SecondaryButton
                          className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                          onClick={() => updateBatchStatus(item.code, "Submitted")}
                        >
                          Send to QA
                        </SecondaryButton>
                      ) : (
                        <span className="text-xs text-slate-500">Managed in Approval & Revision</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
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
    </div>
  );
}
