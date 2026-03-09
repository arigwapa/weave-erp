import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Wallet, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import TabBar from "../../components/ui/TabBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import DetailsModal from "../../components/ui/DetailsModal";
import { financeSubmissionAdminApi, type FinanceSubmissionStatus } from "../../lib/api/financeSubmissionAdminApi";

type CollectionSubmission = {
  collectionDbId: number;
  packageId: string;
  collectionId: string;
  collectionName: string;
  totalBomCost: number;
  recommendedBudget: number;
  notes: string;
  status: FinanceSubmissionStatus;
  feedback: string;
  feedbackDetail: string;
  sentToProductManager: boolean;
  sentToProductionManager: boolean;
};

export default function SubmissionToAdminPage() {
  const [submissions, setSubmissions] = useState<CollectionSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStatusTab, setActiveStatusTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [recommendedBudget, setRecommendedBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ recommendedBudget?: string }>({});
  const [submitError, setSubmitError] = useState("");
  const [feedbackRecord, setFeedbackRecord] = useState<CollectionSubmission | null>(null);

  const mapSubmission = (item: {
    CollectionID: number;
    CollectionCode: string;
    CollectionName: string;
    PackageID: string;
    TotalBomCost: number;
    RecommendedBudget: number;
    Notes: string;
    Status: FinanceSubmissionStatus;
    Feedback: string;
    FeedbackDetail: string;
    SentToProductManager: boolean;
    SentToProductionManager: boolean;
  }): CollectionSubmission => ({
    collectionDbId: Number(item.CollectionID),
    packageId: item.PackageID,
    collectionId: item.CollectionCode || `COL-${item.CollectionID}`,
    collectionName: item.CollectionName,
    totalBomCost: Number(item.TotalBomCost),
    recommendedBudget: Number(item.RecommendedBudget),
    notes: item.Notes || "",
    status: item.Status,
    feedback: item.Feedback,
    feedbackDetail: item.FeedbackDetail || "",
    sentToProductManager: Boolean(item.SentToProductManager),
    sentToProductionManager: Boolean(item.SentToProductionManager),
  });

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const rows = await financeSubmissionAdminApi.listCollections();
      const mapped = rows.map(mapSubmission);
      setSubmissions(mapped);
    } catch {
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmissions();
  }, []);

  const selectedSubmission = useMemo(
    () => submissions.find((item) => item.collectionId === selectedCollectionId) ?? null,
    [selectedCollectionId, submissions],
  );

  const pending = submissions.filter((item) => item.status === "Pending");
  const submitted = submissions.filter((item) => item.status === "Submitted");
  const approved = submissions.filter((item) => item.status === "Approved");
  const disapproved = submissions.filter((item) => item.status === "Rejected" || item.status === "Revision");
  const statusTabs = [
    { id: "pending", label: "Pending Budget Approval", icon: Clock3, count: pending.length + submitted.length },
    { id: "approved", label: "Approved Budget", icon: CheckCircle2, count: approved.length },
    { id: "disapproved", label: "Disapproved Budget", icon: XCircle, count: disapproved.length },
  ];

  const activeRows =
    activeStatusTab === "pending"
      ? [...submitted, ...pending]
      : activeStatusTab === "approved"
        ? approved
        : disapproved;
  const filteredPickerRows = submissions.filter(
    (item) =>
      item.collectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.collectionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.packageId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openPreviewModal = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    const next = submissions.find((item) => item.collectionId === collectionId);
    if (!next) return;
    setRecommendedBudget(String(next.recommendedBudget));
    setNotes(next.notes);
    setFieldErrors({});
    setSubmitError("");
    setIsPreviewModalOpen(true);
  };

  const submitToAdmin = async () => {
    if (!selectedSubmission) return;
    setSubmitError("");
    const nextRecommendedBudget = Number(recommendedBudget || 0);
    if (!Number.isFinite(nextRecommendedBudget) || nextRecommendedBudget <= 0) {
      setFieldErrors({ recommendedBudget: "Recommended Budget must be greater than zero." });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const updated = await financeSubmissionAdminApi.submitCollection(selectedSubmission.collectionDbId, {
        RecommendedBudget: nextRecommendedBudget,
        Notes: notes,
      });
      const mapped = mapSubmission(updated);
      setSubmissions((prev) =>
        prev.map((item) => (item.collectionId === selectedSubmission.collectionId ? mapped : item)),
      );
      setIsPreviewModalOpen(false);
    } catch {
      setSubmitError("Unable to submit package to admin. Please check input values and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Submission to Admin</h1>
        <p className="mt-1 text-sm text-slate-500">
          Prepare final finance package with required fields and status feedback monitoring.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Finance package submission must be prepared and tracked per collection.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Budget Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{pending.length}</p>
            <p className="mt-1 text-xs text-slate-500">Collections waiting for admin decision.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{approved.length}</p>
            <p className="mt-1 text-xs text-slate-500">Collections with accepted budget caps.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Disapproved Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{disapproved.length}</p>
            <p className="mt-1 text-xs text-slate-500">Collections requiring revision and resubmission.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Picker</CardTitle>
          <CardDescription>
            Search collections and click a row to auto-load the finance package preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Collection Filter"
            placeholder="Search collection, ID, or package..."
            inlineControls={<SecondaryButton onClick={() => setSearchQuery("")}>Reset</SecondaryButton>}
          >
            <div className="p-3 text-xs text-slate-500">Collection picker filters can be added here.</div>
          </TableToolbar>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Package ID</TableHead>
                <TableHead>Total BOM Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickerRows.map((item) => (
                <TableRow
                  key={`picker-${item.packageId}`}
                  className={`cursor-pointer ${selectedCollectionId === item.collectionId ? "bg-slate-50" : ""}`}
                  onClick={() => setSelectedCollectionId(item.collectionId)}
                >
                  <TableCell>
                    <p className="font-medium text-slate-800">{item.collectionName}</p>
                    <p className="text-xs text-slate-500">{item.collectionId}</p>
                  </TableCell>
                  <TableCell>{item.packageId}</TableCell>
                  <TableCell>PHP {item.totalBomCost.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right">
                    <PrimaryButton
                      className="!w-auto !rounded-full !px-4 !py-2 !text-xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        openPreviewModal(item.collectionId);
                      }}
                    >
                      Submit to Admin
                    </PrimaryButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPickerRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    {isLoading ? "Loading collection packages..." : "No collection package found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Final Finance Package Preview"
        itemId={selectedSubmission?.packageId ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Wallet size={16} />
          </div>
        }
        gridFields={
          selectedSubmission
            ? [
                { label: "Collection", value: `${selectedSubmission.collectionName} (${selectedSubmission.collectionId})`, icon: Wallet },
                { label: "Status", value: <StatusBadge status={selectedSubmission.status} />, icon: Clock3 },
              ]
            : []
        }
        footerActions={
          <>
            <SecondaryButton onClick={() => setIsPreviewModalOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              onClick={() => void submitToAdmin()}
              isLoading={isSubmitting}
              disabled={!selectedSubmission}
            >
              Submit to Admin
            </PrimaryButton>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Collection</Label>
            <Input
              value={selectedSubmission ? `${selectedSubmission.collectionName} (${selectedSubmission.collectionId})` : ""}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <Label>Total BOM Cost</Label>
            <Input value={selectedSubmission ? selectedSubmission.totalBomCost.toLocaleString() : ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Recommended Budget</Label>
            <Input value={recommendedBudget} onChange={(e) => setRecommendedBudget(e.target.value)} />
            {fieldErrors.recommendedBudget ? (
              <p className="text-xs text-rose-600">{fieldErrors.recommendedBudget}</p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes / Justification</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Finance rationale for budget recommendation..."
            />
          </div>
          {submitError ? <p className="sm:col-span-2 text-xs text-rose-600">{submitError}</p> : null}
        </div>
      </DetailsModal>

      <div>
        <TabBar tabs={statusTabs} activeTab={activeStatusTab} onTabChange={setActiveStatusTab} />
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Budget Status</CardTitle>
          <CardDescription>
            View per-collection budget decisions in tabs and table format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Collection ID</TableHead>
                <TableHead>Package ID</TableHead>
                <TableHead>Total BOM Cost</TableHead>
                <TableHead>Recommended Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    No records in this tab.
                  </TableCell>
                </TableRow>
              ) : (
                activeRows.map((item) => (
                  <TableRow key={item.packageId}>
                    <TableCell className="font-medium text-slate-800">{item.collectionName}</TableCell>
                    <TableCell>{item.collectionId}</TableCell>
                    <TableCell>{item.packageId}</TableCell>
                    <TableCell>PHP {item.totalBomCost.toLocaleString()}</TableCell>
                    <TableCell>PHP {item.recommendedBudget.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <SecondaryButton
                        className="!rounded-full !px-3 !py-1.5 !text-xs"
                        onClick={() => setFeedbackRecord(item)}
                      >
                        View Feedback
                      </SecondaryButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={feedbackRecord !== null}
        onClose={() => setFeedbackRecord(null)}
        title="Admin Feedback"
        itemId={feedbackRecord?.packageId ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Clock3 size={16} />
          </div>
        }
        gridFields={
          feedbackRecord
            ? [
                { label: "Collection", value: `${feedbackRecord.collectionName} (${feedbackRecord.collectionId})`, icon: Wallet },
                { label: "Status", value: <StatusBadge status={feedbackRecord.status} />, icon: Clock3 },
                { label: "Sent To Product Manager", value: feedbackRecord.sentToProductManager ? "Yes" : "No", icon: Clock3 },
                { label: "Sent To Production Manager", value: feedbackRecord.sentToProductionManager ? "Yes" : "No", icon: Clock3 },
              ]
            : []
        }
      >
        <div className="space-y-3 text-sm">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</p>
            <p className="mt-1 text-slate-700">{feedbackRecord?.feedback ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision & Reason</p>
            <p className="mt-1 whitespace-pre-wrap text-slate-700">{feedbackRecord?.feedbackDetail ?? "-"}</p>
          </div>
        </div>
      </DetailsModal>

    </div>
  );
}
