import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightCircle, Eye, RotateCcw, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { plmRevisionsApi, type PlmRevisionQueueItem } from "../../lib/api/plmRevisionsApi";

export default function RevisionsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PlmRevisionQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedRow, setSelectedRow] = useState<PlmRevisionQueueItem | null>(null);
  const [pendingAction, setPendingAction] = useState<"open" | "revise-collection" | "revise-budget" | null>(null);
  const [pendingRow, setPendingRow] = useState<PlmRevisionQueueItem | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const data = await plmRevisionsApi.list();
        setRows(data);
      } catch (error) {
        setRows([]);
        const message = error instanceof Error ? error.message : "Failed to load revision queue.";
        setLoadError(message);
        setToast({ type: "error", message });
      } finally {
        setIsLoading(false);
      }
    };
    void loadQueue();
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const query = searchQuery.toLowerCase();
        return (
          row.CollectionCode.toLowerCase().includes(query) ||
          row.CollectionName.toLowerCase().includes(query) ||
          row.AdminDecision.toLowerCase().includes(query)
        );
      }),
    [rows, searchQuery],
  );

  const requestAction = (action: "open" | "revise-collection" | "revise-budget", row: PlmRevisionQueueItem) => {
    setPendingAction(action);
    setPendingRow(row);
    setConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setConfirmationOpen(false);
    setPendingAction(null);
    setPendingRow(null);
  };

  const confirmTitle =
    pendingAction === "revise-budget"
      ? "Confirm Revise Budget"
      : pendingAction === "revise-collection"
        ? "Confirm Revise Collection"
        : "Confirm Open Collection";

  const confirmText =
    pendingAction === "revise-budget"
      ? "Open Budget"
      : pendingAction === "revise-collection"
        ? "Open Revision"
        : "Open Collection";

  const confirmMessage = pendingRow
    ? pendingAction === "revise-budget"
      ? `Open Budget Planner revision flow for ${pendingRow.CollectionName}?`
      : pendingAction === "revise-collection"
        ? `Open revision workspace for ${pendingRow.CollectionName}?`
        : `Open ${pendingRow.CollectionName} collection details?`
    : "Proceed with this action?";

  const handleConfirmAction = () => {
    const row = pendingRow;
    const action = pendingAction;
    closeConfirmation();
    if (!row || !action) return;

    if (action === "revise-budget") {
      setToast({ type: "success", message: `Opening budget revision for ${row.CollectionCode}...` });
      navigate(`/plm/budget-planner?collectionId=${row.CollectionID}&mode=revision&openBudgetModal=1`);
      return;
    }

    if (action === "revise-collection") {
      setToast({ type: "success", message: `Opening revision workspace for ${row.CollectionCode}...` });
      navigate(`/plm/collections?collectionId=${row.CollectionID}&mode=revision`);
      return;
    }

    setToast({ type: "success", message: `Opening ${row.CollectionCode}...` });
    navigate(`/plm/collections?collectionId=${row.CollectionID}`);
  };

  return (
    <div className="space-y-6">
      {toast ? <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /> : null}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Rejected & Revisions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Collections returned by admin for revision/rework before resubmission to admin.
        </p>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revision Queue</CardTitle>
          <CardDescription>
            Open the affected collection, revise details/BOM/budget, then submit to admin again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Queue Filter"
            placeholder="Search collection code, name, decision..."
            inlineControls={
              <SecondaryButton icon={RotateCcw} onClick={() => setSearchQuery("")}>
                Reset
              </SecondaryButton>
            }
          >
            <div className="p-3 text-xs text-slate-500">Queue populated from admin rejection/revision decisions.</div>
          </TableToolbar>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    {isLoading ? "Loading revision queue..." : "No returned collection found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.CollectionID}>
                    <TableCell>
                      <p className="font-medium text-slate-800">{row.CollectionName}</p>
                      <p className="text-xs text-slate-500">{row.CollectionCode}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.AdminDecision || row.Status} />
                    </TableCell>
                    <TableCell className="max-w-md text-xs text-slate-600">
                      {row.AdminDecisionReason || "No reason provided."}
                    </TableCell>
                    <TableCell>{row.UpdatedAt}</TableCell>
                    <TableCell className="text-right">
                      {row.IsRevision ? (
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            icon={Eye}
                            onClick={() => setSelectedRow(row)}
                          >
                            Details
                          </SecondaryButton>
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            icon={ArrowRightCircle}
                            onClick={() => requestAction("revise-collection", row)}
                          >
                            Revise Collection
                          </SecondaryButton>
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            icon={Wallet}
                            onClick={() => requestAction("revise-budget", row)}
                          >
                            Revise Budget
                          </SecondaryButton>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            icon={Eye}
                            onClick={() => setSelectedRow(row)}
                          >
                            Details
                          </SecondaryButton>
                          <SecondaryButton
                            className="!rounded-full !px-4 !py-2 !text-xs"
                            onClick={() => requestAction("open", row)}
                          >
                            Open Collection
                          </SecondaryButton>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedRow !== null}
        onClose={() => setSelectedRow(null)}
        title="Revision Details"
        itemId={selectedRow?.CollectionCode ?? "-"}
        headerIcon={<Wallet size={18} className="text-indigo-600" />}
        gridFields={
          selectedRow
            ? [
                { label: "Collection Name", value: selectedRow.CollectionName, icon: Wallet },
                { label: "Season", value: selectedRow.Season || "-", icon: Wallet },
                {
                  label: "Decision",
                  value: <StatusBadge status={selectedRow.AdminDecision || selectedRow.Status} />,
                  icon: Wallet,
                },
                { label: "Updated At", value: selectedRow.UpdatedAt || "-", icon: Wallet },
              ]
            : []
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Admin Reason</p>
          <p className="mt-1 text-sm text-slate-700">{selectedRow?.AdminDecisionReason || "No reason provided."}</p>
        </div>
      </DetailsModal>

      <ConfirmationModal
        isOpen={confirmationOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmAction}
        title={confirmTitle}
        message={confirmMessage}
        variant="primary"
        confirmText={confirmText}
      />

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to load revision queue: {loadError}
        </div>
      ) : null}
    </div>
  );
}
