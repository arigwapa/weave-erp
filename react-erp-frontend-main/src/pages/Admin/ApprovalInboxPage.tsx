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
import { adminApprovalInboxApi, type AdminApprovalFinanceItem } from "../../lib/api/adminApprovalInboxApi";

type DecisionType = "approve" | "reject" | "revision";
type SizeProfileRow = {
  size: string;
  values: Record<string, string>;
};

export default function ApprovalInboxPage() {
  const [financeRecords, setFinanceRecords] = useState<AdminApprovalFinanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [activeQueue, setActiveQueue] = useState<"finance">("finance");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [decision, setDecision] = useState<DecisionType | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reason, setReason] = useState("");
  const [detailsRecord, setDetailsRecord] = useState<AdminApprovalFinanceItem | null>(null);
  const [decisionError, setDecisionError] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const loadFinanceQueue = async () => {
      setIsLoading(true);
      try {
        const data = await adminApprovalInboxApi.listFinance();
        setFinanceRecords(data);
      } catch {
        setFinanceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadFinanceQueue();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

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

  const parseSizeProfile = (raw: string): SizeProfileRow[] => {
    if (!raw || !raw.trim()) return [];
    const tryParse = (value: string): unknown => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };

    let parsed: unknown = tryParse(raw);
    if (typeof parsed === "string") {
      parsed = tryParse(parsed);
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];

    return Object.entries(parsed as Record<string, unknown>)
      .filter(([, value]) => value && typeof value === "object" && !Array.isArray(value))
      .map(([size, value]) => ({
        size,
        values: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, fieldValue]) => [
            key,
            fieldValue == null ? "-" : String(fieldValue),
          ]),
        ),
      }));
  };

  const tabs: { id: "finance"; label: string; icon: typeof CheckCircle2; count: number }[] = [
    {
      id: "finance",
      label: "Finance",
      icon: CheckCircle2,
      count: financeRecords.length,
    },
  ];

  const queueRecords = useMemo(
    () =>
      financeRecords.filter((record) => {
        if (activeQueue !== "finance") return false;

        const query = searchQuery.toLowerCase();
        const matchesSearch =
          record.CollectionName.toLowerCase().includes(query) ||
          record.CollectionCode.toLowerCase().includes(query) ||
          record.SubmittedBy.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" || record.Status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [activeQueue, financeRecords, searchQuery, statusFilter]
  );

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(queueRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, queueRecords.length);
  const pagedRecords = queueRecords.slice(startIndex, endIndex);
  const submittedCount = queueRecords.filter((record) => record.Status.toLowerCase() === "submitted").length;
  const revisionCount = queueRecords.filter(
    (record) =>
      record.Status.toLowerCase() === "revised" ||
      record.Status.toLowerCase() === "rejected",
  ).length;

  const submitDecision = async () => {
    if (!detailsRecord || !decision) return;
    if ((decision === "reject" || decision === "revision") && !reason.trim()) {
      setDecisionError("Reason is required for Reject or Revision.");
      return;
    }
    setDecisionError("");
    setIsSubmittingDecision(true);
    try {
      const updated = await adminApprovalInboxApi.submitFinanceDecision(detailsRecord.CollectionID, {
        Decision: decision,
        Reason: reason.trim() || undefined,
      });
      setFinanceRecords((prev) =>
        prev.map((record) => (record.CollectionID === updated.CollectionID ? { ...record, ...updated } : record)),
      );
      setDetailsRecord(null);
      setDecision("");
      setReason("");
    } catch {
      setDecisionError("Unable to submit decision. Please review your input and try again.");
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Approval Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review finance submissions and release approved collections to production.
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
            <CardTitle className="text-sm">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{submittedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Finance packages waiting for admin decision.</p>
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
              setActiveQueue(id as "finance");
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
              filterLabel="Risk Filter"
              placeholder="Search collection code, name, submitter..."
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
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="revised">Revised</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Collection</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Total BOM Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading finance submissions..." : "No records found for this queue."}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
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
                    <TableCell><StatusBadge status={record.Status} /></TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton
                          ariaLabel={`Open details and decision for ${record.CollectionName}`}
                          onClick={() => {
                            setDetailsRecord(record);
                            setDecision("");
                            setReason("");
                          }}
                        >
                          Details & Decision
                        </SecondaryButton>
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
        isOpen={detailsRecord !== null}
        onClose={() => setDetailsRecord(null)}
        title="Approval Details & Decision"
        itemId={detailsRecord?.PackageID ?? "-"}
        headerIcon={
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
            <Eye size={16} />
          </div>
        }
        gridFields={
          detailsRecord
            ? [
                { label: "Collection", value: `${detailsRecord.CollectionName} (${detailsRecord.CollectionCode})`, icon: UserCircle2 },
                { label: "Season", value: detailsRecord.Season, icon: CalendarClock },
                { label: "Submitted By", value: detailsRecord.SubmittedBy, icon: UserCircle2 },
                {
                  label: "Submitted At",
                  value: `${formatSubmittedAtAbsolute(detailsRecord.SubmittedAt)} (${formatSubmittedAtRelative(detailsRecord.SubmittedAt)})`,
                  icon: CalendarClock,
                },
                { label: "Status", value: detailsRecord.Status, icon: ShieldCheck },
                { label: "Admin Decision", value: detailsRecord.AdminDecision || "Pending", icon: ShieldCheck },
              ]
            : []
        }
      >
        <div className="space-y-4">
          {detailsRecord && (
            <Card className="rounded-xl border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Finance Package Details</CardTitle>
                <CardDescription>Budget and justifications submitted by finance.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="text-xs text-slate-500">Total BOM Cost</p>
                  <p className="font-semibold">PHP {detailsRecord.TotalBomCost.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="text-xs text-slate-500">Recommended Budget</p>
                  <p className="font-semibold">PHP {detailsRecord.RecommendedBudget.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="text-xs text-slate-500">Contingency</p>
                  <p className="font-semibold">{detailsRecord.ContingencyPercent}%</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="text-xs text-slate-500">Overall Collection Budget</p>
                  <p className="font-semibold">PHP {detailsRecord.RecommendedBudget.toLocaleString()}</p>
                </div>
                <div className="sm:col-span-2 rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="text-xs text-slate-500">Finance Notes / Justification</p>
                  <p className="whitespace-pre-wrap">{detailsRecord.FinanceNotes || "-"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {detailsRecord?.Products.map((product) => (
            <Card key={product.ProductID} className="rounded-xl border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{product.Name} ({product.SKU})</CardTitle>
                <CardDescription>
                  Product total: PHP {product.TotalCost.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const sizeRows = parseSizeProfile(product.SizeProfile);
                  if (sizeRows.length === 0) {
                    return (
                      <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                        <p className="font-semibold uppercase tracking-wide text-slate-500">Size Profile</p>
                        <p className="mt-1">No structured size profile data.</p>
                      </div>
                    );
                  }

                  const columns = Array.from(
                    new Set(sizeRows.flatMap((row) => Object.keys(row.values))),
                  );
                  return (
                    <div className="rounded-xl border border-slate-200 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Size Profile</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Size</TableHead>
                            {columns.map((column) => (
                              <TableHead key={column}>{column}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sizeRows.map((row) => (
                            <TableRow key={row.size}>
                              <TableCell className="font-medium">{row.size}</TableCell>
                              {columns.map((column) => (
                                <TableCell key={`${row.size}-${column}`}>{row.values[column] ?? "-"}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.BomLines.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-xs text-slate-500">
                          No BOM lines.
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.BomLines.map((line) => (
                        <TableRow key={`${product.ProductID}-${line.BOMID}`}>
                          <TableCell>{line.MaterialName}</TableCell>
                          <TableCell>{line.QtyRequired}</TableCell>
                          <TableCell>{line.Unit}</TableCell>
                          <TableCell>PHP {line.UnitCost}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

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
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase">Reason</p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Required for reject/revision decisions..."
            />
          </div>
          {decisionError ? <p className="text-xs text-rose-600">{decisionError}</p> : null}
          <div className="flex flex-wrap gap-2 justify-end">
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              isLoading={isSubmittingDecision}
              onClick={() => void submitDecision()}
            >
              <Send size={14} />
              Submit Decision
            </PrimaryButton>
          </div>
        </div>
      </DetailsModal>
    </div>
  );
}
