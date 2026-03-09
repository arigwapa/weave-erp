import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, FileDiff, GitBranch, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

type ChecklistStatus = "done" | "pending";

const diffItems = [
  {
    area: "BOM",
    before: "20 line items, Poly lining standard",
    after: "26 line items, replaced lining material",
    impact: "+6 lines",
  },
  {
    area: "Cost",
    before: "PHP 1,220,000 projected",
    after: "PHP 1,310,000 projected",
    impact: "+PHP 90,000",
  },
  {
    area: "Design Notes",
    before: "Base seam requirement",
    after: "Added reinforcement stitching requirement",
    impact: "Specification update",
  },
];

const checklist: { label: string; status: ChecklistStatus }[] = [
  { label: "Product complete", status: "done" },
  { label: "BOM complete", status: "done" },
  { label: "Design notes complete", status: "pending" },
  { label: "Impact reason encoded", status: "done" },
];

export default function VersionWorkspacePage() {
  const [sourceRecord, setSourceRecord] = useState("CO-2026-022 / V2 (Rejected)");
  const [changeType, setChangeType] = useState("material-update");
  const [changeReason, setChangeReason] = useState("");

  const completion = useMemo(() => {
    const done = checklist.filter((item) => item.status === "done").length;
    return Math.round((done / checklist.length) * 100);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Version Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create revisions from rejected records with change reason, diff visibility, and submit readiness checks.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Revision entries must include source record, change type, and rationale before submit routing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revision Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <StatusBadge status="In Progress" />
              <p className="text-xs text-slate-500">Drafting and impact review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Diff Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{diffItems.length}</p>
            <p className="mt-1 text-xs text-slate-500">Detected changes from prior version.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{completion}%</p>
            <p className="mt-1 text-xs text-slate-500">Checklist completion score.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Revision Builder</CardTitle>
          <CardDescription>Create and document a clean revision package for re-submission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Source Record</Label>
              <Input value={sourceRecord} onChange={(e) => setSourceRecord(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Change Type</Label>
              <Select value={changeType} onValueChange={setChangeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select change type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material-update">Material Update</SelectItem>
                  <SelectItem value="cost-adjustment">Cost Adjustment</SelectItem>
                  <SelectItem value="design-adjustment">Design Adjustment</SelectItem>
                  <SelectItem value="combined-change">Combined Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Workflow Guard</Label>
              <div className="flex h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                <span className="text-xs text-slate-600">Rejection-linked revision only</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Change Reason (Required)</Label>
            <Textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Link update rationale directly to rejection feedback and mention expected impact."
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} />
              Guardrail: missing rationale blocks revision submit action.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <SecondaryButton icon={ClipboardCheck}>Save Draft</SecondaryButton>
            <SecondaryButton icon={FileDiff}>Preview Diff</SecondaryButton>
            <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs" icon={GitBranch}>
              Create Revision
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Diff View</CardTitle>
            <CardDescription>Structured comparison against the previous approved version.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {diffItems.map((item) => (
              <div key={item.area} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.area}</p>
                    <p className="mt-1 text-sm text-slate-600">Before: {item.before}</p>
                    <p className="text-sm font-medium text-slate-800">After: {item.after}</p>
                  </div>
                  <StatusBadge status={item.impact} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Submission Checklist</CardTitle>
            <CardDescription>All checkpoints must be complete before routing to Finance/Admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{item.label}</span>
                <StatusBadge status={item.status === "done" ? "Done" : "Pending"} />
              </div>
            ))}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submission Readiness</p>
                <p className="text-xs font-semibold text-slate-700">{completion}%</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs" icon={ShieldCheck}>
                Submit to Admin/Finance
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
