import { createPortal } from "react-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import { InspectionChecklistSection } from "./InspectionChecklistSection";
import { InspectionDefectSection } from "./InspectionDefectSection";
import { InspectionSummarySection } from "./InspectionSummarySection";
import type {
  ChecklistTemplateItem,
  QaBatchItem,
  SaveInspectionAttachmentDto,
  SaveInspectionChecklistResultDto,
  SaveInspectionDefectDto,
} from "../../lib/api/inspectionApi";

export type InspectionModalState = {
  aqlLevel: string;
  inspectionLevel: string;
  sampleSize: number;
  acceptThreshold: number;
  rejectThreshold: number;
  notes: string;
  inspectionDate: string;
  checklistResults: SaveInspectionChecklistResultDto[];
  defects: SaveInspectionDefectDto[];
  attachments: SaveInspectionAttachmentDto[];
};

type Props = {
  isOpen: boolean;
  row: QaBatchItem | null;
  inspectorLabel: string;
  branchName: string;
  checklistTemplates: ChecklistTemplateItem[];
  state: InspectionModalState;
  setState: React.Dispatch<React.SetStateAction<InspectionModalState>>;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
};

export function InspectionModal({
  isOpen,
  row,
  inspectorLabel,
  branchName,
  checklistTemplates,
  state,
  setState,
  onClose,
  onSave,
  isSaving,
}: Props) {
  if (!isOpen || !row) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Add Inspection</h3>
          <p className="mt-1 text-xs text-slate-500">Record QA findings and finalize this inspection.</p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 1 - Batch Information</h4>
            <p className="mb-3 text-xs text-slate-500">Read-only production batch context.</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>BatchBoardID</Label>
                <Input value={String(row.BatchBoardID)} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>Batch Number</Label>
                <Input value={row.BatchNumber} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>Product Name</Label>
                <Input value={row.ProductName} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>Production Quantity</Label>
                <Input value={String(row.QuantityProduced)} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>Production Date</Label>
                <Input value={row.DateSubmitted} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>Branch</Label>
                <Input value={branchName || "N/A"} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>Submitted By</Label>
                <Input value="Production" readOnly className="bg-slate-50" />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 2 - Inspection Setup</h4>
            <p className="mb-3 text-xs text-slate-500">Set AQL, inspection level, and sampling values.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Inspector</Label>
                <Input value={inspectorLabel} readOnly className="bg-slate-50" />
              </div>
              <div>
                <Label>AQL Level</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={state.aqlLevel}
                  onChange={(e) => setState((prev) => ({ ...prev, aqlLevel: e.target.value }))}
                >
                  <option value="0.0">0.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2.5">2.5</option>
                  <option value="4.0">4.0</option>
                </select>
              </div>
              <div>
                <Label>Inspection Level</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={state.inspectionLevel}
                  onChange={(e) => setState((prev) => ({ ...prev, inspectionLevel: e.target.value }))}
                >
                  <option value="General I">General I</option>
                  <option value="General II">General II</option>
                  <option value="General III">General III</option>
                </select>
              </div>
              <div>
                <Label>Sample Size</Label>
                <Input
                  type="number"
                  min={1}
                  value={state.sampleSize}
                  onChange={(e) => setState((prev) => ({ ...prev, sampleSize: Math.max(1, Number(e.target.value) || 1) }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Inspection Date</Label>
                <Input
                  type="datetime-local"
                  value={state.inspectionDate}
                  onChange={(e) => setState((prev) => ({ ...prev, inspectionDate: e.target.value }))}
                />
              </div>
            </div>
          </section>

          <InspectionChecklistSection
            templates={checklistTemplates}
            values={state.checklistResults}
            onChange={(rows) => setState((prev) => ({ ...prev, checklistResults: rows }))}
          />

          <InspectionDefectSection
            rows={state.defects}
            onChange={(rows) => setState((prev) => ({ ...prev, defects: rows }))}
          />

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 5 - Thresholds</h4>
            <p className="mb-3 text-xs text-slate-500">Manual thresholds for acceptance and rejection.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Accept Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  value={state.acceptThreshold}
                  onChange={(e) => setState((prev) => ({ ...prev, acceptThreshold: Math.max(0, Number(e.target.value) || 0) }))}
                />
              </div>
              <div>
                <Label>Reject Threshold</Label>
                <Input
                  type="number"
                  min={0}
                  value={state.rejectThreshold}
                  onChange={(e) => setState((prev) => ({ ...prev, rejectThreshold: Math.max(0, Number(e.target.value) || 0) }))}
                />
              </div>
            </div>
          </section>

          <InspectionSummarySection
            defects={state.defects}
            sampleSize={state.sampleSize}
            acceptThreshold={state.acceptThreshold}
            rejectThreshold={state.rejectThreshold}
          />

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 7 - Notes</h4>
            <p className="mb-3 text-xs text-slate-500">Observations, rework instructions, and quality remarks.</p>
            <Textarea
              value={state.notes}
              onChange={(e) => setState((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Inspection notes..."
            />
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 8 - Attachments</h4>
            <p className="mb-3 text-xs text-slate-500">
              Upload UI scaffold is ready. You can wire your file upload service and set FileUrl values here.
            </p>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-500">
              Attachment upload placeholder (FileName/FileUrl/FileType fields are already supported in API payload).
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Inspection"}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
