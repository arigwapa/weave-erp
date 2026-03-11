import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import {
  CalendarClock,
  ClipboardCheck,
  Factory,
  FlaskConical,
  ShieldCheck,
  Sigma,
  Tag,
  UserCircle2,
  Warehouse,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../lib/AuthContext";
import {
  inspectionApi,
  type ChecklistTemplateItem,
  type QaBatchItem,
  type SaveInspectionDto,
} from "../../lib/api/inspectionApi";
import { capaApi } from "../../lib/api/capaApi";
import { InspectionTabs } from "../../components/qa/InspectionTabs";
import { CapaPromptModal } from "../../components/qa/CapaPromptModal";
import { InspectionModal, type InspectionModalState } from "../../components/qa/InspectionModal";
import { CapaFormModal, type CapaFormState } from "../../components/qa/CapaFormModal";
import { TableToolbar } from "../../components/ui/TableToolbar";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";

type InspectionTab = "pending" | "ongoing" | "completed";

export default function InspectionFormPage() {
  const { user } = useAuth();
  const [pendingItems, setPendingItems] = useState<QaBatchItem[]>([]);
  const [ongoingItems, setOngoingItems] = useState<QaBatchItem[]>([]);
  const [completedItems, setCompletedItems] = useState<QaBatchItem[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectionTab>("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<QaBatchItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "accepted" | "rejected" | "review required">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCapaPrompt, setShowCapaPrompt] = useState(false);
  const [showCapaForm, setShowCapaForm] = useState(false);
  const [isSavingCapa, setIsSavingCapa] = useState(false);
  const [capaInspectionId, setCapaInspectionId] = useState<number | null>(null);
  const [capaBatchLabel, setCapaBatchLabel] = useState("");
  const [detailsRow, setDetailsRow] = useState<QaBatchItem | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<null | { type: "start"; row: QaBatchItem } | { type: "saveInspection" }>(null);
  const [toastState, setToastState] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [capaForm, setCapaForm] = useState<CapaFormState>({
    issueTitle: "",
    rootCause: "",
    correctiveAction: "",
    preventiveAction: "",
    responsibleDepartment: "Production",
    responsibleUserId: "",
    dueDate: "",
    status: "Open",
  });

  const [modalState, setModalState] = useState<InspectionModalState>({
    aqlLevel: "2.5",
    inspectionLevel: "General II",
    sampleSize: 1,
    acceptThreshold: 0,
    rejectThreshold: 1,
    notes: "",
    inspectionDate: new Date().toISOString().slice(0, 16),
    checklistResults: [],
    defects: [],
    attachments: [],
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pending, ongoing, completed, templates] = await Promise.all([
        inspectionApi.getPending(),
        inspectionApi.getOngoing(),
        inspectionApi.getCompleted(),
        inspectionApi.getChecklistTemplate(),
      ]);
      setPendingItems(Array.isArray(pending) ? pending : []);
      setOngoingItems(Array.isArray(ongoing) ? ongoing : []);
      setCompletedItems(Array.isArray(completed) ? completed : []);
      setChecklistTemplates(Array.isArray(templates) ? templates : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll().catch(() => undefined);
    const intervalId = window.setInterval(() => {
      loadAll().catch(() => undefined);
    }, 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const openAddInspection = (row: QaBatchItem) => {
    setSelectedRow(row);
    setModalState({
      aqlLevel: "2.5",
      inspectionLevel: "General II",
      sampleSize: Math.max(1, row.QuantityProduced || 1),
      acceptThreshold: 0,
      rejectThreshold: 1,
      notes: "",
      inspectionDate: new Date().toISOString().slice(0, 16),
      checklistResults: checklistTemplates.map((x) => ({
        ChecklistTemplateID: x.ChecklistTemplateID,
        ChecklistStatus: "Pass",
      })),
      defects: [],
      attachments: [],
    });
    setIsModalOpen(true);
  };

  const startInspection = async (batchBoardId: number) => {
    try {
      await inspectionApi.startInspection(batchBoardId);
      await loadAll();
      setActiveTab("ongoing");
      setToastState({ type: "success", message: `Inspection started for BatchBoardID ${batchBoardId}.` });
    } catch {
      setToastState({ type: "error", message: "Unable to start inspection. Please try again." });
    }
  };

  const saveInspection = async () => {
    if (!selectedRow) return;
    const hasChecklist = modalState.checklistResults.length > 0;
    if (!hasChecklist) {
      setToastState({ type: "error", message: "Checklist answers are required." });
      return;
    }
    if (modalState.sampleSize <= 0) {
      setToastState({ type: "error", message: "Sample size must be greater than 0." });
      return;
    }
    if (modalState.acceptThreshold > modalState.rejectThreshold) {
      setToastState({ type: "error", message: "Accept threshold must be less than or equal to reject threshold." });
      return;
    }

    const normalizedDefects = modalState.defects
      .map((x) => ({
        ...x,
        DefectCategory: x.DefectCategory.trim(),
        DefectDescription: x.DefectDescription.trim(),
        Remarks: x.Remarks?.trim() || "",
      }))
      // Ignore untouched placeholder rows added by "Add Defect Row".
      .filter((x) => x.DefectCategory.length > 0 || x.DefectDescription.length > 0 || x.Remarks.length > 0);

    const invalidDefect = normalizedDefects.some(
      (x) => !x.DefectType || x.AffectedQuantity <= 0 || !x.DefectCategory || !x.DefectDescription,
    );
    if (invalidDefect) {
      setToastState({
        type: "error",
        message: "Each filled defect row must include type, category, description, and affected quantity > 0.",
      });
      return;
    }

    const payload: SaveInspectionDto = {
      BatchBoardID: selectedRow.BatchBoardID,
      AQLLevel: modalState.aqlLevel,
      InspectionLevel: modalState.inspectionLevel,
      SampleSize: modalState.sampleSize,
      AcceptThreshold: modalState.acceptThreshold,
      RejectThreshold: modalState.rejectThreshold,
      InspectionDate: new Date(modalState.inspectionDate).toISOString(),
      Notes: modalState.notes.trim(),
      AutoCreateCapaDraft: false,
      ChecklistResults: modalState.checklistResults,
      Defects: normalizedDefects,
      Attachments: modalState.attachments,
    };

    setIsSaving(true);
    try {
      const result = await inspectionApi.saveInspection(payload);
      setIsModalOpen(false);
      setSelectedRow(null);
      await loadAll();
      setActiveTab("completed");
      setToastState({ type: "success", message: "Inspection saved successfully." });
      if (result.Result === "Rejected") {
        setCapaInspectionId(result.InspectionID);
        setCapaBatchLabel(selectedRow.BatchNumber);
        setCapaForm((prev) => ({
          ...prev,
          issueTitle: `Rejected batch ${selectedRow.BatchNumber}`,
        }));
        setShowCapaPrompt(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const completedTodayCount = useMemo(() => {
    const today = new Date().toDateString();
    return completedItems.filter((x) => (x.InspectionDate ? new Date(x.InspectionDate).toDateString() : "") === today).length;
  }, [completedItems]);

  const rejectedCount = useMemo(() => completedItems.filter((x) => x.Result === "Rejected").length, [completedItems]);

  const filteredPending = useMemo(() => {
    const key = search.trim().toLowerCase();
    const onlyForInspection = pendingItems.filter((x) => (x.Status ?? "").trim().toLowerCase() === "for inspection");
    if (!key) return onlyForInspection;
    return onlyForInspection.filter((x) =>
      [
        x.BatchBoardID,
        x.BatchNumber,
        x.VersionNumber,
        x.ProductName,
        x.CollectionName,
        x.DateSubmitted,
      ]
        .join(" ")
        .toLowerCase()
        .includes(key),
    );
  }, [pendingItems, search]);

  const filteredOngoing = useMemo(() => {
    const key = search.trim().toLowerCase();
    const onlyForInspection = ongoingItems.filter((x) => (x.Status ?? "").trim().toLowerCase() === "for inspection");
    if (!key) return onlyForInspection;
    return onlyForInspection.filter((x) =>
      [
        x.BatchBoardID,
        x.BatchNumber,
        x.VersionNumber,
        x.ProductName,
        x.CollectionName,
        x.Inspector ?? "",
        x.StartedAt ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(key),
    );
  }, [ongoingItems, search]);

  const filteredCompleted = useMemo(() => {
    const key = search.trim().toLowerCase();
    return completedItems.filter((x) => {
      const matchResult =
        resultFilter === "all" ||
        (x.Result ?? "").toLowerCase() === resultFilter;
      if (!matchResult) return false;
      if (!key) return true;
      return [
        x.BatchBoardID,
        x.BatchNumber,
        x.VersionNumber,
        x.ProductName,
        x.CollectionName,
        x.Inspector ?? "",
        x.InspectionDate ?? "",
        x.Result ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(key);
    });
  }, [completedItems, search, resultFilter]);

  const openCapaForm = () => {
    setShowCapaPrompt(false);
    setShowCapaForm(true);
  };

  const autoCreateCapaDraft = async () => {
    if (!capaInspectionId) return;
    try {
      await capaApi.create({
        InspectionID: capaInspectionId,
        IssueTitle: capaForm.issueTitle || `Rejected batch ${capaBatchLabel}`,
        RootCause: "",
        CorrectiveAction: "",
        PreventiveAction: "",
        ResponsibleDepartment: "Production",
        Status: "Open",
      });
      setShowCapaPrompt(false);
      setCapaInspectionId(null);
      setCapaBatchLabel("");
      setToastState({ type: "success", message: "CAPA draft created." });
    } catch {
      setToastState({ type: "error", message: "Unable to create CAPA draft." });
    }
  };

  const createCapaNow = async () => {
    if (!capaInspectionId) return;
    if (!capaForm.issueTitle.trim()) {
      setToastState({ type: "error", message: "Issue title is required." });
      return;
    }

    setIsSavingCapa(true);
    try {
      await capaApi.create({
        InspectionID: capaInspectionId,
        IssueTitle: capaForm.issueTitle.trim(),
        RootCause: capaForm.rootCause.trim(),
        CorrectiveAction: capaForm.correctiveAction.trim(),
        PreventiveAction: capaForm.preventiveAction.trim(),
        ResponsibleDepartment: capaForm.responsibleDepartment.trim() || "Production",
        ResponsibleUserID: capaForm.responsibleUserId ? Number(capaForm.responsibleUserId) : undefined,
        DueDate: capaForm.dueDate ? new Date(capaForm.dueDate).toISOString() : undefined,
        Status: capaForm.status,
      });
      setShowCapaForm(false);
      setCapaInspectionId(null);
      setCapaBatchLabel("");
      setCapaForm({
        issueTitle: "",
        rootCause: "",
        correctiveAction: "",
        preventiveAction: "",
        responsibleDepartment: "Production",
        responsibleUserId: "",
        dueDate: "",
        status: "Open",
      });
      setToastState({ type: "success", message: "CAPA created successfully." });
    } catch {
      setToastState({ type: "error", message: "Unable to create CAPA. Please try again." });
    } finally {
      setIsSavingCapa(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Inspections</h1>
            <p className="mt-1 text-sm text-slate-500">
              Main QA workspace with pending, ongoing, and completed inspection batches.
            </p>
          </div>
          <StatusBadge status="Operational" />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Inspection submission requires checklist completion, valid sampling thresholds, and defect traceability.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader><CardTitle className="text-sm">Pending Inspections</CardTitle><CardDescription>{pendingItems.length}</CardDescription></CardHeader></Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader><CardTitle className="text-sm">Ongoing Inspections</CardTitle><CardDescription>{ongoingItems.length}</CardDescription></CardHeader></Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader><CardTitle className="text-sm">Completed Today</CardTitle><CardDescription>{completedTodayCount}</CardDescription></CardHeader></Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-sm"><CardHeader><CardTitle className="text-sm">Rejected Batches</CardTitle><CardDescription>{rejectedCount}</CardDescription></CardHeader></Card>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">QA Inspection Flow</CardTitle>
          <CardDescription>Pending → Ongoing → Completed in one workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <TableToolbar
            searchQuery={search}
            setSearchQuery={setSearch}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            placeholder="Search batch, product, version, inspector..."
            filterLabel="Result Filter"
          >
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Completed Result</p>
              <Select
                value={resultFilter}
                onValueChange={(value: "all" | "accepted" | "rejected" | "review required") => {
                  setResultFilter(value);
                  setIsFilterOpen(false);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Filter result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="review required">Review Required</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500">Applies to completed tab rows only.</p>
            </div>
          </TableToolbar>
          <InspectionTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingRows={filteredPending}
            ongoingRows={filteredOngoing}
            completedRows={filteredCompleted}
            loading={loading}
            onStartInspection={(row) => setPendingConfirm({ type: "start", row })}
            onAddInspection={openAddInspection}
            onViewDetails={setDetailsRow}
          />
        </CardContent>
      </Card>

      <InspectionModal
        isOpen={isModalOpen}
        row={selectedRow}
        inspectorLabel={`${user?.fullname || user?.username || "QA Inspector"} (#${user?.userID || 0})`}
        branchName={user?.branchName || "N/A"}
        checklistTemplates={checklistTemplates}
        state={modalState}
        setState={setModalState}
        onClose={() => setIsModalOpen(false)}
        onSave={() => setPendingConfirm({ type: "saveInspection" })}
        isSaving={isSaving}
      />
      <CapaPromptModal
        open={showCapaPrompt}
        onCreateNow={openCapaForm}
        onAutoCreateDraft={autoCreateCapaDraft}
        onSkip={() => setShowCapaPrompt(false)}
      />
      <CapaFormModal
        open={showCapaForm}
        inspectionId={capaInspectionId}
        state={capaForm}
        setState={setCapaForm}
        submitting={isSavingCapa}
        onCancel={() => setShowCapaForm(false)}
        onSubmit={createCapaNow}
      />

      <DetailsModal
        isOpen={!!detailsRow}
        onClose={() => setDetailsRow(null)}
        title="Inspection Batch Details"
        itemId={detailsRow ? String(detailsRow.BatchBoardID) : ""}
        headerIcon={<ClipboardCheck size={18} className="text-indigo-600" />}
        gridFields={[
          { label: "BatchBoardID", value: detailsRow ? String(detailsRow.BatchBoardID) : "-", icon: Sigma },
          { label: "Batch Number", value: detailsRow?.BatchNumber || "-", icon: Tag },
          { label: "Version", value: detailsRow?.VersionNumber || "-", icon: FlaskConical },
          { label: "Product", value: detailsRow?.ProductName || "-", icon: Factory },
          { label: "Collection", value: detailsRow?.CollectionName || "-", icon: Warehouse },
          { label: "Quantity Produced", value: detailsRow ? String(detailsRow.QuantityProduced ?? 0) : "-", icon: Sigma },
          { label: "Inspector", value: detailsRow?.Inspector || "-", icon: UserCircle2 },
          { label: "Inspection Date", value: detailsRow?.InspectionDate || detailsRow?.DateSubmitted || "-", icon: CalendarClock },
          { label: "Result", value: detailsRow ? <StatusBadge status={detailsRow.Result || "Pending"} /> : "-", icon: ShieldCheck },
        ]}
        hideDefaultCloseButton={detailsRow && activeTab === "pending" ? true : false}
        footerActions={
          detailsRow && activeTab === "pending" ? (
            <>
              <SecondaryButton
                className="!h-10 !rounded-xl !px-4 !py-2 !text-xs"
                onClick={() => setDetailsRow(null)}
              >
                Close
              </SecondaryButton>
              <PrimaryButton
                type="button"
                className="!h-10 !w-auto !rounded-xl !px-4 !py-2 !text-xs"
                onClick={() => {
                  setPendingConfirm({ type: "start", row: detailsRow });
                  setDetailsRow(null);
                }}
              >
                Start Inspection
              </PrimaryButton>
            </>
          ) : undefined
        }
      />

      <ConfirmationModal
        isOpen={!!pendingConfirm}
        onClose={() => setPendingConfirm(null)}
        onConfirm={() => {
          if (!pendingConfirm) return;
          if (pendingConfirm.type === "start") {
            void startInspection(pendingConfirm.row.BatchBoardID);
            setPendingConfirm(null);
            return;
          }
          void saveInspection();
          setPendingConfirm(null);
        }}
        title={pendingConfirm?.type === "saveInspection" ? "Confirm Inspection Save" : "Start Inspection?"}
        message={
          pendingConfirm?.type === "saveInspection"
            ? "This will submit the inspection result and move the batch into completed records."
            : pendingConfirm
              ? `Start inspection for batch ${pendingConfirm.row.BatchNumber}?`
              : "Confirm action."
        }
        confirmText={pendingConfirm?.type === "saveInspection" ? "Save Inspection" : "Start"}
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
