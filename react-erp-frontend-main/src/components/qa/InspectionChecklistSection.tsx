import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { ChecklistTemplateItem, SaveInspectionChecklistResultDto } from "../../lib/api/inspectionApi";

type Props = {
  templates: ChecklistTemplateItem[];
  values: SaveInspectionChecklistResultDto[];
  onChange: (rows: SaveInspectionChecklistResultDto[]) => void;
};

export function InspectionChecklistSection({ templates, values, onChange }: Props) {
  const setStatus = (templateId: number, status: "Pass" | "Fail" | "N/A") => {
    const next = values.map((row) =>
      row.ChecklistTemplateID === templateId ? { ...row, ChecklistStatus: status } : row,
    );
    onChange(next);
  };

  const setRemarks = (templateId: number, remarks: string) => {
    const next = values.map((row) =>
      row.ChecklistTemplateID === templateId ? { ...row, Remarks: remarks } : row,
    );
    onChange(next);
  };

  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 3 - Checklist</h4>
      <p className="mb-3 text-xs text-slate-500">Answer each checklist item with Pass/Fail/N/A and remarks for failed checks.</p>
      <div className="space-y-3">
        {templates.map((template) => {
          const value = values.find((x) => x.ChecklistTemplateID === template.ChecklistTemplateID);
          const status = value?.ChecklistStatus ?? "Pass";
          return (
            <div key={template.ChecklistTemplateID} className="rounded-xl border border-slate-200 p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>{template.ChecklistName}</Label>
                  <p className="text-[11px] text-slate-500">{template.Category}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(template.ChecklistTemplateID, v as "Pass" | "Fail" | "N/A")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pass">Pass</SelectItem>
                      <SelectItem value="Fail">Fail</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {status === "Fail" && (
                <div className="mt-3">
                  <Label>Remarks</Label>
                  <Input
                    value={value?.Remarks ?? ""}
                    onChange={(e) => setRemarks(template.ChecklistTemplateID, e.target.value)}
                    placeholder="What failed and why?"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
