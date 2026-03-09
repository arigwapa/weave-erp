import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AlertTriangle, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { financeBudgetPlannerApi } from "../../lib/api/financeBudgetPlannerApi";
import DetailsModal from "../../components/ui/DetailsModal";
import BudgetUtilizationBar from "../../components/ui/BudgetUtilizationBar";
import Toast from "../../components/ui/Toast";

type CollectionBudget = {
  collectionId: number;
  id: string;
  collection: string;
  collectionStatus: string;
  plannerStatus: string;
  isAdminApproved: boolean;
  adminDecision: string;
  adminDecisionReason: string;
  totalBomCost: number;
  budgetCap: number;
  wasteAllowanceBudget: number;
  contingency: number;
  forecast: number;
  reservedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  readiness: "Complete" | "Review" | "Pending";
  riskFlags: string[];
};

const SQL_DECIMAL_MAX = 99_999_999_999_999.99;

export default function BudgetPlannerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [budgetRows, setBudgetRows] = useState<CollectionBudget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [budgetCapInput, setBudgetCapInput] = useState("");
  const [wasteAllowanceBudgetInput, setWasteAllowanceBudgetInput] = useState("");
  const [contingencyInput, setContingencyInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ budgetCap?: string; contingency?: string; wasteAllowanceBudget?: string }>({});
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const mapRow = (item: {
    CollectionID: number;
    CollectionCode: string;
    CollectionName: string;
    CollectionStatus: string;
    PlannerStatus: string;
    IsAdminApproved: boolean;
    AdminDecision: string;
    AdminDecisionReason: string;
    TotalBomCost: number;
    BudgetCap: number;
    WasteAllowanceBudget: number;
    Contingency: number;
    Forecast: number;
    ReservedAmount: number;
    SpentAmount: number;
    RemainingAmount: number;
    Readiness: "Complete" | "Review" | "Pending";
    RiskFlags: string[];
  }): CollectionBudget => ({
    collectionId: item.CollectionID,
    id: item.CollectionCode || `COL-${item.CollectionID}`,
    collection: item.CollectionName,
    collectionStatus: item.CollectionStatus || "",
    plannerStatus: item.PlannerStatus || "Planning Budget",
    isAdminApproved: Boolean(item.IsAdminApproved),
    adminDecision: item.AdminDecision || "",
    adminDecisionReason: item.AdminDecisionReason || "",
    totalBomCost: Number(item.TotalBomCost),
    budgetCap: Number(item.BudgetCap),
    wasteAllowanceBudget: Number(item.WasteAllowanceBudget ?? 0),
    contingency: Number(item.Contingency),
    forecast: Number(item.Forecast),
    reservedAmount: Number(item.ReservedAmount ?? 0),
    spentAmount: Number(item.SpentAmount ?? 0),
    remainingAmount: Number(item.RemainingAmount ?? 0),
    readiness: item.Readiness,
    riskFlags: item.RiskFlags ?? [],
  });

  const loadBudgetRows = async () => {
    setIsLoading(true);
    try {
      const rows = await financeBudgetPlannerApi.listCollections();
      const mapped = rows.map(mapRow);
      setBudgetRows(mapped);
      const pickerCandidates = mapped.filter((item) => !item.isAdminApproved);
      if (pickerCandidates.length > 0) {
        const nextSelected = pickerCandidates.find((item) => item.id === selectedId) ?? pickerCandidates[0];
        setSelectedId(nextSelected.id);
        setBudgetCapInput(String(nextSelected.budgetCap));
        setWasteAllowanceBudgetInput(String(nextSelected.wasteAllowanceBudget));
        setContingencyInput(String(nextSelected.contingency));
      } else {
        setSelectedId("");
        setBudgetCapInput("");
        setWasteAllowanceBudgetInput("");
        setContingencyInput("");
      }
    } catch {
      setBudgetRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBudgetRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCollection = useMemo(
    () => budgetRows.find((item) => item.id === selectedId) ?? null,
    [budgetRows, selectedId],
  );

  const totalCap = budgetRows.reduce((acc, item) => acc + item.budgetCap, 0);
  const totalForecast = budgetRows.reduce((acc, item) => acc + item.forecast, 0);
  const pickerRows = useMemo(
    () => budgetRows.filter((item) => !item.isAdminApproved),
    [budgetRows],
  );
  const matrixRows = useMemo(
    () => budgetRows.filter((item) => item.isAdminApproved),
    [budgetRows],
  );
  const filteredRows = useMemo(
    () =>
      pickerRows.filter(
        (item) =>
          item.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [pickerRows, searchQuery],
  );

  const applyPlan = async () => {
    if (!selectedCollection) return;
    setSaveError("");
    const errors: { budgetCap?: string; contingency?: string; wasteAllowanceBudget?: string } = {};
    const nextCap = Number(budgetCapInput || selectedCollection.budgetCap);
    const nextWasteAllowanceBudget = Number(wasteAllowanceBudgetInput || selectedCollection.wasteAllowanceBudget);
    const nextContingency = Number(contingencyInput || selectedCollection.contingency);
    if (!Number.isFinite(nextCap) || nextCap <= 0) errors.budgetCap = "Collection Budget Cap must be greater than zero.";
    else if (nextCap > SQL_DECIMAL_MAX) {
      errors.budgetCap = "Collection Budget Cap must be at most 99,999,999,999,999.99.";
    }
    if (!Number.isFinite(nextWasteAllowanceBudget) || nextWasteAllowanceBudget < 0) {
      errors.wasteAllowanceBudget = "Waste Allowance Budget must be 0 or greater.";
    }
    else if (nextWasteAllowanceBudget > SQL_DECIMAL_MAX) {
      errors.wasteAllowanceBudget = "Waste Allowance Budget must be at most 99,999,999,999,999.99.";
    }
    if (!Number.isFinite(nextContingency) || nextContingency < 0 || nextContingency > 100) {
      errors.contingency = "Contingency % must be between 0 and 100.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const updated = await financeBudgetPlannerApi.savePlan(selectedCollection.collectionId, {
        BudgetCap: nextCap,
        Contingency: nextContingency,
        WasteAllowanceBudget: nextWasteAllowanceBudget,
      });
      const mapped = mapRow(updated);
      setBudgetRows((prev) => prev.map((item) => (item.id === selectedCollection.id ? mapped : item)));
      setBudgetCapInput(String(mapped.budgetCap));
      setWasteAllowanceBudgetInput(String(mapped.wasteAllowanceBudget));
      setContingencyInput(String(mapped.contingency));
      setIsBudgetModalOpen(false);
      setToast({ type: "success", message: "Budget plan saved successfully." });
    } catch (error) {
      const validationErrors =
        typeof error === "object" && error !== null && "validationErrors" in error
          ? (error as { validationErrors?: Record<string, string[] | string> }).validationErrors
          : undefined;

      const normalizedErrors: { budgetCap?: string; contingency?: string; wasteAllowanceBudget?: string } = {};
      if (validationErrors) {
        for (const [key, value] of Object.entries(validationErrors)) {
          const first = (Array.isArray(value) ? value : [value]).find(
            (entry) => typeof entry === "string" && entry.trim().length > 0,
          );
          if (!first) continue;
          const normalizedKey = key.toLowerCase();
          if (normalizedKey.includes("budgetcap")) normalizedErrors.budgetCap = first;
          else if (normalizedKey.includes("contingency")) normalizedErrors.contingency = first;
          else if (normalizedKey.includes("wasteallowancebudget")) normalizedErrors.wasteAllowanceBudget = first;
        }
      }
      setFieldErrors(normalizedErrors);
      setSaveError(
        Object.values(normalizedErrors).find(Boolean) ??
          (error instanceof Error ? error.message : "Unable to save budget plan. Please check validations and try again."),
      );
      setToast({ type: "error", message: "Unable to save budget plan. Please check the form and try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const onSelectCollection = (id: string) => {
    setSelectedId(id);
    const next = pickerRows.find((item) => item.id === id);
    if (!next) return;
    setBudgetCapInput(String(next.budgetCap));
    setWasteAllowanceBudgetInput(String(next.wasteAllowanceBudget));
    setContingencyInput(String(next.contingency));
  };

  const openBudgetPlanModal = (id: string) => {
    onSelectCollection(id);
    setFieldErrors({});
    setSaveError("");
    setIsBudgetModalOpen(true);
  };

  useEffect(() => {
    const collectionIdParam = searchParams.get("collectionId");
    const shouldOpenBudgetModal = searchParams.get("openBudgetModal") === "1";
    if (!collectionIdParam || !shouldOpenBudgetModal || budgetRows.length === 0) return;

    const target = budgetRows.find((item) => String(item.collectionId) === collectionIdParam && !item.isAdminApproved);
    if (!target) return;

    openBudgetPlanModal(target.id);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("openBudgetModal");
    setSearchParams(nextParams, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, budgetRows, setSearchParams]);

  return (
    <div className="space-y-6">
      {toast ? (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Budget Planner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Set budget caps, contingency, readiness checks, and risk flags before admin submission.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Budget plan must be maintained per collection and include contingency before admin submission.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Collections Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{budgetRows.length}</p>
            <p className="mt-1 text-xs text-slate-500">Active collection budget plans.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Budget Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-700">PHP {totalCap.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Combined cap for selected season scope.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">PHP {totalForecast.toLocaleString()}</p>
            <p className="mt-1 text-xs text-slate-500">Projected spend across collections.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Picker</CardTitle>
          <CardDescription>
            Search collections and select a row to load budget configuration and BOM totals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Collection Filter"
            placeholder="Search collection name or ID..."
            inlineControls={
              <SecondaryButton onClick={() => setSearchQuery("")}>Reset</SecondaryButton>
            }
          >
            <div className="p-3 text-xs text-slate-500">
              Source: approved collections from Costing Workbench (For Budget Planning).
            </div>
          </TableToolbar>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Total BOM Cost</TableHead>
                <TableHead>Budget Cap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`cursor-pointer ${selectedId === row.id ? "bg-slate-50" : ""}`}
                  onClick={() => onSelectCollection(row.id)}
                >
                  <TableCell>
                    <p className="font-medium text-slate-800">{row.collection}</p>
                    <p className="text-xs text-slate-500">{row.id}</p>
                  </TableCell>
                  <TableCell>PHP {row.totalBomCost.toLocaleString()}</TableCell>
                  <TableCell>PHP {row.budgetCap.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={row.plannerStatus} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <SecondaryButton
                        className="!rounded-full !px-4 !py-2 !text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          openBudgetPlanModal(row.id);
                        }}
                      >
                        Add Budget Plan
                      </SecondaryButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-slate-500">
                    {isLoading ? "Loading budget plans..." : "No collections pending admin approval."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Budget Configuration (Per Collection)"
        itemId={selectedCollection?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Wallet size={16} />
          </div>
        }
        gridFields={
          selectedCollection
            ? [
                { label: "Collection", value: `${selectedCollection.collection} (${selectedCollection.id})`, icon: Wallet },
                { label: "Status", value: <StatusBadge status={selectedCollection.plannerStatus} />, icon: ShieldCheck },
              ]
            : []
        }
        footerActions={
          <PrimaryButton
            className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
            onClick={() => void applyPlan()}
            isLoading={isSaving}
            disabled={!selectedCollection}
          >
            Save Budget Plan
          </PrimaryButton>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Collection</Label>
            <Input value={selectedCollection ? `${selectedCollection.collection} (${selectedCollection.id})` : ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Total BOM Cost</Label>
            <Input value={selectedCollection ? selectedCollection.totalBomCost.toLocaleString() : ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Collection Budget Cap</Label>
            <Input value={budgetCapInput} onChange={(e) => setBudgetCapInput(e.target.value)} />
            {fieldErrors.budgetCap ? <p className="text-xs text-rose-600">{fieldErrors.budgetCap}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Contingency %</Label>
            <Input value={contingencyInput} onChange={(e) => setContingencyInput(e.target.value)} />
            {fieldErrors.contingency ? <p className="text-xs text-rose-600">{fieldErrors.contingency}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Waste Allowance Budget</Label>
            <Input
              value={wasteAllowanceBudgetInput}
              onChange={(e) => setWasteAllowanceBudgetInput(e.target.value)}
            />
            {fieldErrors.wasteAllowanceBudget ? (
              <p className="text-xs text-rose-600">{fieldErrors.wasteAllowanceBudget}</p>
            ) : null}
          </div>
          {saveError ? <p className="sm:col-span-2 text-xs text-rose-600">{saveError}</p> : null}
        </div>
      </DetailsModal>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Budget Matrix</CardTitle>
          <CardDescription>Per-collection cap, forecast, contingency, and readiness state.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Budget Cap</TableHead>
                <TableHead>Forecast</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Contingency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrixRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <p className="font-medium text-slate-800">{row.collection}</p>
                    <p className="text-xs text-slate-500">{row.id}</p>
                  </TableCell>
                  <TableCell>PHP {row.budgetCap.toLocaleString()}</TableCell>
                  <TableCell>PHP {row.forecast.toLocaleString()}</TableCell>
                  <TableCell className="min-w-[220px]">
                    <BudgetUtilizationBar
                      spent={row.reservedAmount + row.spentAmount}
                      total={row.reservedAmount + row.spentAmount + row.remainingAmount}
                      showLabels
                      currency="PHP "
                    />
                  </TableCell>
                  <TableCell>{row.contingency}%</TableCell>
                  <TableCell><StatusBadge status="Admin Approved" /></TableCell>
                </TableRow>
              ))}
              {matrixRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-slate-500">
                    No admin-approved collection budgets yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Approval Readiness Indicators</CardTitle>
            <CardDescription>
              Checks by selected collection: all products costed, no missing materials, variance threshold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["All products costed", "Complete"],
              ["No missing materials", "Complete"],
              ["Variance threshold check", "Review"],
            ].map(([label, status]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{label}</span>
                <StatusBadge status={String(status)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Risk Flags</CardTitle>
            <CardDescription>Highlight budget shortfall and dependency-sensitive materials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(selectedCollection?.riskFlags ?? []).map((flag) => (
              <div key={flag} className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{flag}</span>
              </div>
            ))}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-600" />
                Selected Collection: {selectedCollection?.collection ?? "-"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
