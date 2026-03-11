import { Label } from "../ui/label";
import { Input } from "../ui/input";
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
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Section 3 - Checklist</h4>
      <p className="mb-4 text-xs text-slate-500">Answer each checklist item with Pass/Fail/N/A and add remarks for failed checks.</p>
      <div className="space-y-3">
        {templates.map((template) => {
          const value = values.find((x) => x.ChecklistTemplateID === template.ChecklistTemplateID);
          const status = value?.ChecklistStatus ?? "Pass";
          const radioName = `checklist-status-${template.ChecklistTemplateID}`;
          return (
            <div key={template.ChecklistTemplateID} className="rounded-xl border border-slate-200 p-3.5">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <Label className="text-sm font-semibold text-slate-800">{template.ChecklistName}</Label>
                  <p className="text-[11px] text-slate-500">{template.Category}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(["Pass", "Fail", "N/A"] as const).map((option) => {
                    const isSelected = status === option;
                    const activeClass =
                      option === "Pass"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : option === "Fail"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-slate-300 bg-slate-50 text-slate-700";
                    return (
                      <label
                        key={option}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isSelected ? activeClass : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={radioName}
                          value={option}
                          checked={isSelected}
                          onChange={() => setStatus(template.ChecklistTemplateID, option)}
                          className="h-3.5 w-3.5 accent-slate-700"
                        />
                        {option}
                      </label>
                    );
                  })}
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
