import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Eye, RotateCcw, Send, ShieldCheck, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";
import Pagination from "../../components/ui/Pagination";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import DetailsModal from "../../components/ui/DetailsModal";
import {
  adminApprovalInboxApi,
  type AdminApprovalFinanceItem,
  type AdminApprovalQaItem,
} from "../../lib/api/adminApprovalInboxApi";
import { binLocationApi, type BinLocation } from "../../lib/api/binLocationApi";

type DecisionType = "approve" | "reject" | "revision";

export default function ApprovalInboxPage() {
  const [productRecords, setProductRecords] = useState<AdminApprovalFinanceItem[]>([]);
  const [qaRecords, setQaRecords] = useState<AdminApprovalQaItem[]>([]);
  const [binLocations, setBinLocations] = useState<BinLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isSendingInventory, setIsSendingInventory] = useState(false);
  const [activeQueue, setActiveQueue] = useState<"product" | "qa">("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [decision, setDecision] = useState<DecisionType | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reason, setReason] = useState("");
  const [selectedProductRecord, setSelectedProductRecord] = useState<AdminApprovalFinanceItem | null>(null);
  const [selectedQaRecord, setSelectedQaRecord] = useState<AdminApprovalQaItem | null>(null);
  const [decisionError, setDecisionError] = useState("");
  const [isSendInventoryOpen, setIsSendInventoryOpen] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState("");
  const [sendInventoryError, setSendInventoryError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const loadQueues = async () => {
      setIsLoading(true);
      try {
        const [productData, qaData, bins] = await Promise.all([
          adminApprovalInboxApi.listFinance(),
          adminApprovalInboxApi.listQa(),
          binLocationApi.list(),
        ]);
        setProductRecords(productData);
        setQaRecords(qaData);
        setBinLocations(bins);
      } catch {
        setProductRecords([]);
        setQaRecords([]);
        setBinLocations([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadQueues();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const normalizeProductQueueStatus = (status: string) =>
    status.trim().toLowerCase() === "submitted" ? "For Approval" : status;

  const formatSubmittedAtRelative = (value: string): string => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const diffMs = Math.max(0, nowMs - parsed.getTime());
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const formatSubmittedAtAbsolute = (value: string): string => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const tabs: { id: "product" | "qa"; label: string; icon: typeof CheckCircle2; count: number }[] = [
    { id: "product", label: "Product", icon: CheckCircle2, count: productRecords.length },
    { id: "qa", label: "Quality Assurance", icon: CheckCircle2, count: qaRecords.length },
  ];

  const filteredProductRecords = useMemo(
    () =>
      productRecords.filter((record) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          record.CollectionName.toLowerCase().includes(query) ||
          record.CollectionCode.toLowerCase().includes(query) ||
          record.SubmittedBy.toLowerCase().includes(query);
        const normalizedStatus = normalizeProductQueueStatus(record.Status);
        const matchesStatus =
          statusFilter === "all" || normalizedStatus.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [productRecords, searchQuery, statusFilter],
  );

  const filteredQaRecords = useMemo(
    () =>
      qaRecords.filter((record) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          String(record.InspectionID).includes(query) ||
          String(record.BatchBoardID).includes(query) ||
          record.BatchNumber.toLowerCase().includes(query) ||
          record.ProductName.toLowerCase().includes(query) ||
          record.SenderName.toLowerCase().includes(query);
        const matchesStatus =
          statusFilter === "all" || record.Status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [qaRecords, searchQuery, statusFilter],
  );

  const queueRecords = activeQueue === "product" ? filteredProductRecords : filteredQaRecords;
  const statusOptions = useMemo(() => {
    const source =
      activeQueue === "product"
        ? filteredProductRecords.map((record) => normalizeProductQueueStatus(record.Status))
        : filteredQaRecords.map((record) => record.Status);
    return Array.from(
      new Set(
        source
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    );
  }, [activeQueue, filteredProductRecords, filteredQaRecords]);

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(queueRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, queueRecords.length);
  const pagedRecords = queueRecords.slice(startIndex, endIndex);
  const submittedCount = filteredProductRecords.filter(
    (record) => normalizeProductQueueStatus(record.Status).trim().toLowerCase() === "for approval",
  ).length;
  const revisionCount = filteredProductRecords.filter((record) => {
    const status = record.Status.toLowerCase();
    return status === "revised" || status === "rejected";
  }).length;

  const activeBins = useMemo(
    () => binLocations.filter((item) => item.IsBinActive),
    [binLocations],
  );

  const isBinOccupied = (bin: BinLocation) => {
    const status = (bin.OccupancyStatus ?? "").trim().toLowerCase();
    return (
      status.includes("occupied") ||
      (bin.OccupiedQuantity ?? 0) > 0 ||
      (bin.OccupiedVersionID ?? 0) > 0
    );
  };

  const submitDecision = async () => {
    if (!selectedProductRecord || !decision) return;
    if ((decision === "reject" || decision === "revision") && !reason.trim()) {
      setDecisionError("Reason is required for Reject or Revision.");
      return;
    }
    setDecisionError("");
    setIsSubmittingDecision(true);
    try {
      await adminApprovalInboxApi.submitFinanceDecision(selectedProductRecord.CollectionID, {
        Decision: decision,
        Reason: reason.trim() || undefined,
      });
      setProductRecords((prev) =>
        prev.filter((record) => record.CollectionID !== selectedProductRecord.CollectionID),
      );
      setSelectedProductRecord(null);
      setDecision("");
      setReason("");
    } catch {
      setDecisionError("Unable to submit decision. Please review your input and try again.");
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const sendQaToProduction = async (record: AdminApprovalQaItem) => {
    try {
      await adminApprovalInboxApi.submitQaToProduction(record.InspectionID);
      setQaRecords((prev) => prev.filter((item) => item.InspectionID !== record.InspectionID));
      if (selectedQaRecord?.InspectionID === record.InspectionID) setSelectedQaRecord(null);
    } catch {
      window.alert("Unable to submit to production. Please try again.");
    }
  };

  const openSendInventoryModal = (record: AdminApprovalQaItem) => {
    setSelectedQaRecord(record);
    setSelectedBinId("");
    setSendInventoryError("");
    setIsSendInventoryOpen(true);
  };

  const submitSendInventory = async () => {
    if (!selectedQaRecord) return;
    const parsedBinId = Number(selectedBinId);
    if (!Number.isFinite(parsedBinId) || parsedBinId <= 0) {
      setSendInventoryError("Please select a bin location.");
      return;
    }
    const selectedBin = activeBins.find((bin) => bin.BinID === parsedBinId);
    if (!selectedBin) {
      setSendInventoryError("Selected bin location is not available.");
      return;
    }
    if (isBinOccupied(selectedBin)) {
      setSendInventoryError("Selected bin is occupied. Please choose an available bin.");
      return;
    }
    setSendInventoryError("");
    setIsSendingInventory(true);
    try {
      await adminApprovalInboxApi.sendQaToInventory(selectedQaRecord.InspectionID, {
        BinID: parsedBinId,
      });
      setQaRecords((prev) => prev.filter((item) => item.InspectionID !== selectedQaRecord.InspectionID));
      setSelectedQaRecord(null);
      setIsSendInventoryOpen(false);
      setSelectedBinId("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send to inventory.";
      setSendInventoryError(message);
    } finally {
      setIsSendingInventory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Approval Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review product and QA submissions and route approved items.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Rejected or returned approvals should include a clear reason before final submission.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{queueRecords.length}</p>
            <p className="mt-1 text-xs text-slate-500">Records matching selected tab and filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">For Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{submittedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Product packages waiting for admin decision.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revisions / Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{revisionCount}</p>
            <p className="mt-1 text-xs text-slate-500">Items returned to Product Manager.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <TabBar
            tabs={tabs}
            activeTab={activeQueue}
            onTabChange={(id) => {
              setActiveQueue(id as "product" | "qa");
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Queue Records</CardTitle>
          <CardDescription>
            Prioritized list of submissions for the selected queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Status Filter"
              placeholder="Search..."
              inlineControls={
                <SecondaryButton
                  icon={RotateCcw}
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
            >
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              {activeQueue === "product" ? (
                <TableRow>
                  <TableHead className="px-6">Collection</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Total BOM Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pl-6 text-left">Actions</TableHead>
                </TableRow>
              ) : (
                <TableRow>
                  <TableHead className="px-6">Inspection ID</TableHead>
                  <TableHead>BatchBoard ID</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Sender User</TableHead>
                  <TableHead>Product Version</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="pl-6 text-left">Actions</TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeQueue === "product" ? 6 : 8} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading queue records..." : "No records found for this queue."}
                  </TableCell>
                </TableRow>
              ) : activeQueue === "product" ? (
                (pagedRecords as AdminApprovalFinanceItem[]).map((record) => (
                  <TableRow key={`${record.CollectionID}-${record.PackageID}`}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{record.CollectionName}</p>
                      <p className="text-xs text-slate-500">{record.CollectionCode}</p>
                    </TableCell>
                    <TableCell>{record.SubmittedBy}</TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-800">{formatSubmittedAtAbsolute(record.SubmittedAt)}</p>
                      <p className="text-xs text-slate-500">{formatSubmittedAtRelative(record.SubmittedAt)}</p>
                    </TableCell>
                    <TableCell>PHP {record.TotalBomCost.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={normalizeProductQueueStatus(record.Status)} /></TableCell>
                    <TableCell className="pl-6">
                      <SecondaryButton
                        ariaLabel={`Open details and decision for ${record.CollectionName}`}
                        onClick={() => {
                          setSelectedProductRecord(record);
                          setDecision("");
                          setReason("");
                          setDecisionError("");
                        }}
                      >
                        View details
                      </SecondaryButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                (pagedRecords as AdminApprovalQaItem[]).map((record) => (
                  <TableRow key={record.InspectionID}>
                    <TableCell className="px-6">{record.InspectionID}</TableCell>
                    <TableCell>{record.BatchBoardID}</TableCell>
                    <TableCell>{record.BatchNumber}</TableCell>
                    <TableCell>{record.SenderName}</TableCell>
                    <TableCell>{record.ProductVersion}</TableCell>
                    <TableCell>{record.ProductName}</TableCell>
                    <TableCell><StatusBadge status={record.Result} /></TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <SecondaryButton onClick={() => setSelectedQaRecord(record)}>
                          View details
                        </SecondaryButton>
                        {record.Result.trim().toLowerCase() === "pass" ? (
                          <PrimaryButton
                            className="!w-auto !rounded-full !px-4 !py-2 !text-xs"
                            onClick={() => openSendInventoryModal(record)}
                          >
                            Send to inventory
                          </PrimaryButton>
                        ) : (
                          <PrimaryButton
                            className="!w-auto !rounded-full !px-4 !py-2 !text-xs"
                            onClick={() => void sendQaToProduction(record)}
                          >
                            Submit to production
                          </PrimaryButton>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={queueRecords.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedProductRecord !== null}
        onClose={() => setSelectedProductRecord(null)}
        title="Approval Details & Decision"
        itemId={selectedProductRecord?.PackageID ?? "-"}
        headerIcon={
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Eye size={16} />
          </div>
        }
        gridFields={
          selectedProductRecord
            ? [
                { label: "Collection", value: `${selectedProductRecord.CollectionName} (${selectedProductRecord.CollectionCode})`, icon: UserCircle2 },
                { label: "Season", value: selectedProductRecord.Season, icon: CalendarClock },
                { label: "Submitted By", value: selectedProductRecord.SubmittedBy, icon: UserCircle2 },
                {
                  label: "Submitted At",
                  value: `${formatSubmittedAtAbsolute(selectedProductRecord.SubmittedAt)} (${formatSubmittedAtRelative(selectedProductRecord.SubmittedAt)})`,
                  icon: CalendarClock,
                },
                { label: "Status", value: normalizeProductQueueStatus(selectedProductRecord.Status), icon: ShieldCheck },
                { label: "Admin Decision", value: selectedProductRecord.AdminDecision || "Pending", icon: ShieldCheck },
              ]
            : []
        }
        footerActions={
          <PrimaryButton
            className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
            isLoading={isSubmittingDecision}
            onClick={() => void submitDecision()}
          >
            <Send size={14} />
            Submit Decision
          </PrimaryButton>
        }
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">Decision</p>
          <Select value={decision} onValueChange={(value) => setDecision(value as DecisionType)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="revision">Return for revision</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs font-semibold text-slate-500 uppercase">Reason</p>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Required for reject/revision decisions..."
          />
          {decisionError ? <p className="text-xs text-rose-600">{decisionError}</p> : null}
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={selectedQaRecord !== null}
        onClose={() => setSelectedQaRecord(null)}
        title="QA Inspection Details"
        itemId={selectedQaRecord ? String(selectedQaRecord.InspectionID) : "-"}
        headerIcon={
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Eye size={16} />
          </div>
        }
        gridFields={
          selectedQaRecord
            ? [
                { label: "Inspection ID", value: selectedQaRecord.InspectionID, icon: ShieldCheck },
                { label: "BatchBoard ID", value: selectedQaRecord.BatchBoardID, icon: ShieldCheck },
                { label: "AQL Level", value: selectedQaRecord.AQLLevel || "-", icon: ShieldCheck },
                { label: "Inspection Level", value: selectedQaRecord.InspectionLevel || "-", icon: ShieldCheck },
                { label: "Sample Size", value: selectedQaRecord.SampleSize, icon: ShieldCheck },
                { label: "Defects Found", value: selectedQaRecord.DefectsFound, icon: ShieldCheck },
                { label: "Accepted Threshold", value: selectedQaRecord.AcceptThreshold, icon: ShieldCheck },
                { label: "Rejected Threshold", value: selectedQaRecord.RejectThreshold, icon: ShieldCheck },
                { label: "Inspection Date", value: formatSubmittedAtAbsolute(selectedQaRecord.InspectionDate), icon: CalendarClock },
                { label: "Note", value: selectedQaRecord.Notes || "-", icon: UserCircle2 },
              ]
            : []
        }
      />

      <DetailsModal
        isOpen={isSendInventoryOpen}
        onClose={() => setIsSendInventoryOpen(false)}
        title="Send To Inventory"
        itemId={selectedQaRecord ? String(selectedQaRecord.InspectionID) : "-"}
        headerIcon={
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Send size={16} />
          </div>
        }
        gridFields={
          selectedQaRecord
            ? [
                { label: "Inspection ID", value: selectedQaRecord.InspectionID, icon: ShieldCheck },
                { label: "Batch Number", value: selectedQaRecord.BatchNumber, icon: ShieldCheck },
                { label: "Product Name", value: selectedQaRecord.ProductName, icon: UserCircle2 },
                { label: "Result", value: selectedQaRecord.Result, icon: ShieldCheck },
              ]
            : []
        }
        footerActions={
          <PrimaryButton
            className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
            isLoading={isSendingInventory}
            onClick={() => void submitSendInventory()}
          >
            <Send size={14} />
            Confirm Send
          </PrimaryButton>
        }
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase">Bin Location</p>
          <Select value={selectedBinId} onValueChange={setSelectedBinId}>
            <SelectTrigger>
              <SelectValue placeholder="Select available bin" />
            </SelectTrigger>
            <SelectContent>
              {activeBins.length === 0 ? (
                <SelectItem value="none" disabled>
                  No available bins
                </SelectItem>
              ) : (
                activeBins.map((bin) => {
                  const isOccupied = isBinOccupied(bin);
                  return (
                    <SelectItem
                      key={bin.BinID}
                      value={String(bin.BinID)}
                      disabled={isOccupied}
                    >
                      {(bin.BinLocation || bin.BinCode) +
                        (isOccupied ? " (Occupied)" : " (Available)")}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
          {sendInventoryError ? <p className="text-xs text-rose-600">{sendInventoryError}</p> : null}
        </div>
      </DetailsModal>
    </div>
  );
}
