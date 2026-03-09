import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
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
  const [showCapaPrompt, setShowCapaPrompt] = useState(false);
  const [showCapaForm, setShowCapaForm] = useState(false);
  const [isSavingCapa, setIsSavingCapa] = useState(false);
  const [capaInspectionId, setCapaInspectionId] = useState<number | null>(null);
  const [capaBatchLabel, setCapaBatchLabel] = useState("");
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
    await inspectionApi.startInspection(batchBoardId);
    await loadAll();
    setActiveTab("ongoing");
  };

  const saveInspection = async () => {
    if (!selectedRow) return;
    const hasChecklist = modalState.checklistResults.length > 0;
    if (!hasChecklist) {
      window.alert("Checklist answers are required.");
      return;
    }
    if (modalState.sampleSize <= 0) {
      window.alert("Sample size must be greater than 0.");
      return;
    }
    if (modalState.acceptThreshold > modalState.rejectThreshold) {
      window.alert("Accept threshold must be less than or equal to reject threshold.");
      return;
    }

    const invalidDefect = modalState.defects.some(
      (x) => !x.DefectType || x.AffectedQuantity <= 0,
    );
    if (invalidDefect) {
      window.alert("Each defect row must have type and affected quantity > 0.");
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
      Defects: modalState.defects,
      Attachments: modalState.attachments,
    };

    setIsSaving(true);
    try {
      const result = await inspectionApi.saveInspection(payload);
      setIsModalOpen(false);
      setSelectedRow(null);
      await loadAll();
      setActiveTab("completed");
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
    if (!key) return pendingItems;
    return pendingItems.filter((x) =>
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
    if (!key) return ongoingItems;
    return ongoingItems.filter((x) =>
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
    window.alert("CAPA draft created.");
  };

  const createCapaNow = async () => {
    if (!capaInspectionId) return;
    if (!capaForm.issueTitle.trim()) {
      window.alert("Issue title is required.");
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
      window.alert("CAPA created successfully.");
    } finally {
      setIsSavingCapa(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inspections</h1>
        <p className="mt-1 text-sm text-slate-500">
          Main QA workspace with pending, ongoing, and completed inspection batches.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Pending Inspections</CardTitle><CardDescription>{pendingItems.length}</CardDescription></CardHeader></Card>
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Ongoing Inspections</CardTitle><CardDescription>{ongoingItems.length}</CardDescription></CardHeader></Card>
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Completed Today</CardTitle><CardDescription>{completedTodayCount}</CardDescription></CardHeader></Card>
        <Card className="rounded-2xl"><CardHeader><CardTitle className="text-sm">Rejected Batches</CardTitle><CardDescription>{rejectedCount}</CardDescription></CardHeader></Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">QA Inspection Flow</CardTitle>
          <CardDescription>Pending → Ongoing → Completed in one workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batch, product, version, inspector..."
            />
            <Select
              value={resultFilter}
              onValueChange={(value: "all" | "accepted" | "rejected" | "review required") => setResultFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="review required">Review Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <InspectionTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingRows={filteredPending}
            ongoingRows={filteredOngoing}
            completedRows={filteredCompleted}
            loading={loading}
            onStartInspection={startInspection}
            onAddInspection={openAddInspection}
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
        onSave={saveInspection}
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
    </div>
  );
}
