import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Eye, FileText, FlaskConical, RefreshCcw, ShieldCheck, Sigma, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { TableToolbar } from "../../components/ui/TableToolbar";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { inspectionApi, type InspectionHistoryItem } from "../../lib/api/inspectionApi";

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function InspectionHistoryPage() {
  const [rows, setRows] = useState<InspectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InspectionHistoryItem | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [toastState, setToastState] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await inspectionApi.listHistory();
      setRows(Array.isArray(data) ? data : []);
      return true;
    } catch {
      setRows([]);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((item) => {
      if (resultFilter !== "all" && item.Result.toLowerCase() !== resultFilter) return false;
      if (!keyword) return true;
      const haystack = [
        item.InspectionID,
        item.BatchBoardID,
        item.BatchCode,
        item.ProductName,
        item.CollectionName,
        item.InspectorName,
        item.AQLLevel,
        item.InspectionLevel,
        item.QaDecision,
        item.Notes ?? "",
        item.DefectEntries ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [rows, search, resultFilter]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Inspection History</h1>
            <p className="mt-1 text-sm text-slate-500">
              Completed QA records with AQL parameters, thresholds, defects, result, notes, and audit timestamps.
            </p>
          </div>
          <StatusBadge status="Operational" />
        </div>
      </div>

      <Card className="rounded-2xl border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-sky-50/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm text-indigo-900">Flow aligned with Inspection table</CardTitle>
          <CardDescription className="text-indigo-800">
            Start Inspection marks batch as in progress. Finish Inspection saves full inspection details in the database and records the final quality decision.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Completed Inspections</CardTitle>
          <CardDescription>
            Use search and status filters to review Accepted/Rejected outcomes and inspector activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={search}
            setSearchQuery={setSearch}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            placeholder="Search inspection, batch, product, collection, inspector..."
            filterLabel="Result Filter"
            inlineControls={
              <div className="flex items-center gap-2">
                <SecondaryButton icon={RefreshCcw} onClick={() => setConfirmResetOpen(true)}>
                  Reset Filters
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => {
                    void (async () => {
                      const ok = await load();
                      setToastState({
                        type: ok ? "success" : "error",
                        message: ok ? "Inspection history refreshed." : "Unable to refresh inspection history.",
                      });
                    })();
                  }}
                >
                  Refresh Data
                </SecondaryButton>
              </div>
            }
          >
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Result</p>
              <Select
                value={resultFilter}
                onValueChange={(value) => {
                  setResultFilter(value);
                  setIsFilterOpen(false);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Filter by result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspection</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>AQL</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead>Defects</TableHead>
                <TableHead>Accept/Reject</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Inspection Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-left">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="py-8 text-center text-sm text-slate-500">
                    Loading inspection history...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="py-8 text-center text-sm text-slate-500">
                    No completed inspections found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.InspectionID}>
                    <TableCell className="font-medium">#{item.InspectionID}</TableCell>
                    <TableCell>{item.BatchCode || `Batch #${item.BatchBoardID}`}</TableCell>
                    <TableCell>{item.ProductName || "-"}</TableCell>
                    <TableCell>{item.CollectionName || "-"}</TableCell>
                    <TableCell>{item.InspectorName}</TableCell>
                    <TableCell>{item.AQLLevel}</TableCell>
                    <TableCell>{item.InspectionLevel}</TableCell>
                    <TableCell>{item.SampleSize.toLocaleString()}</TableCell>
                    <TableCell>{item.DefectsFound.toLocaleString()}</TableCell>
                    <TableCell>
                      {item.AcceptThreshold}/{item.RejectThreshold}
                    </TableCell>
                    <TableCell>{item.QaDecision || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.Result} />
                    </TableCell>
                    <TableCell>{formatDate(item.InspectionDate)}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={item.DefectEntries || item.Notes || ""}>
                      {item.DefectEntries || item.Notes || "-"}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        aria-label={`View details for inspection ${item.InspectionID}`}
                        onClick={() => setSelectedRow(item)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Eye size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={!!selectedRow}
        onClose={() => setSelectedRow(null)}
        title="Inspection History Details"
        itemId={selectedRow ? String(selectedRow.InspectionID) : ""}
        headerIcon={<ClipboardCheck size={18} className="text-indigo-600" />}
        gridFields={[
          { label: "Inspection ID", value: selectedRow ? `#${selectedRow.InspectionID}` : "-", icon: Sigma },
          { label: "Batch", value: selectedRow?.BatchCode || "-", icon: FileText },
          { label: "Product", value: selectedRow?.ProductName || "-", icon: FlaskConical },
          { label: "Collection", value: selectedRow?.CollectionName || "-", icon: FileText },
          { label: "Inspector", value: selectedRow?.InspectorName || "-", icon: UserCircle2 },
          { label: "AQL / Level", value: selectedRow ? `${selectedRow.AQLLevel} / ${selectedRow.InspectionLevel}` : "-", icon: ShieldCheck },
          { label: "Sample / Defects", value: selectedRow ? `${selectedRow.SampleSize} / ${selectedRow.DefectsFound}` : "-", icon: Sigma },
          { label: "Thresholds", value: selectedRow ? `${selectedRow.AcceptThreshold}/${selectedRow.RejectThreshold}` : "-", icon: ShieldCheck },
          { label: "Decision", value: selectedRow?.QaDecision || "-", icon: ShieldCheck },
          { label: "Result", value: selectedRow ? <StatusBadge status={selectedRow.Result} /> : "-", icon: ShieldCheck },
          { label: "Inspection Date", value: formatDate(selectedRow?.InspectionDate), icon: FileText },
          { label: "Created At", value: formatDate(selectedRow?.CreatedAt), icon: FileText },
        ]}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Defect Entries</p>
            <p className="mt-1 text-sm text-slate-700">{selectedRow?.DefectEntries || "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Inspector Notes</p>
            <p className="mt-1 text-sm text-slate-700">{selectedRow?.Notes || "-"}</p>
          </div>
        </div>
      </DetailsModal>

      <ConfirmationModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={() => {
          setSearch("");
          setResultFilter("all");
          setConfirmResetOpen(false);
          setToastState({ type: "success", message: "Filters reset." });
        }}
        title="Reset Filters?"
        message="This will clear search text and set result filter back to All Results."
        confirmText="Reset"
        cancelText="Cancel"
      />

      {toastState ? (
        <Toast type={toastState.type} message={toastState.message} onClose={() => setToastState(null)} />
      ) : null}
    </div>
  );
}
