import { createPortal } from "react-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";

export type CapaFormState = {
  issueTitle: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  responsibleDepartment: string;
  responsibleUserId: string;
  dueDate: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
};

type Props = {
  open: boolean;
  inspectionId: number | null;
  state: CapaFormState;
  setState: React.Dispatch<React.SetStateAction<CapaFormState>>;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function CapaFormModal({
  open,
  inspectionId,
  state,
  setState,
  submitting,
  onCancel,
  onSubmit,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Create CAPA</h3>
          <p className="mt-1 text-xs text-slate-500">
            Corrective and Preventive Action for rejected inspection #{inspectionId ?? "-"}.
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <Label>Issue Title</Label>
            <Input
              value={state.issueTitle}
              onChange={(e) => setState((prev) => ({ ...prev, issueTitle: e.target.value }))}
              placeholder="Short issue title"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Responsible Department</Label>
              <Input
                value={state.responsibleDepartment}
                onChange={(e) => setState((prev) => ({ ...prev, responsibleDepartment: e.target.value }))}
                placeholder="e.g. Production"
              />
            </div>
            <div>
              <Label>Responsible User ID (optional)</Label>
              <Input
                type="number"
                min={1}
                value={state.responsibleUserId}
                onChange={(e) => setState((prev) => ({ ...prev, responsibleUserId: e.target.value }))}
                placeholder="User ID"
              />
            </div>
            <div>
              <Label>Due Date (optional)</Label>
              <Input
                type="datetime-local"
                value={state.dueDate}
                onChange={(e) => setState((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={state.status}
                onChange={(e) => setState((prev) => ({ ...prev, status: e.target.value as CapaFormState["status"] }))}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Root Cause</Label>
            <Textarea
              value={state.rootCause}
              onChange={(e) => setState((prev) => ({ ...prev, rootCause: e.target.value }))}
              placeholder="Describe probable root cause..."
            />
          </div>

          <div>
            <Label>Corrective Action</Label>
            <Textarea
              value={state.correctiveAction}
              onChange={(e) => setState((prev) => ({ ...prev, correctiveAction: e.target.value }))}
              placeholder="Immediate correction plan..."
            />
          </div>

          <div>
            <Label>Preventive Action</Label>
            <Textarea
              value={state.preventiveAction}
              onChange={(e) => setState((prev) => ({ ...prev, preventiveAction: e.target.value }))}
              placeholder="Prevent recurrence..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-xs" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save CAPA"}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
