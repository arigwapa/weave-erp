import { Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";
import type { SaveInspectionDefectDto } from "../../lib/api/inspectionApi";

type Props = {
  rows: SaveInspectionDefectDto[];
  onChange: (rows: SaveInspectionDefectDto[]) => void;
};

export function InspectionDefectSection({ rows, onChange }: Props) {
  const addRow = () => {
    onChange([
      ...rows,
      {
        DefectType: "Minor",
        DefectCategory: "",
        DefectDescription: "",
        AffectedQuantity: 1,
        Remarks: "",
      },
    ]);
  };

  const updateRow = (index: number, patch: Partial<SaveInspectionDefectDto>) => {
    const next = rows.map((row, idx) => (idx === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, idx) => idx !== index));
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Section 4 - Defect Details</h4>
          <p className="mt-1 text-xs text-slate-500">Add one row per observed defect with type, category, quantity, and remarks.</p>
        </div>
        <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Defect Row
        </PrimaryButton>
      </div>
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">Defect #{idx + 1}</p>
              <SecondaryButton className="!rounded-full !px-3 !py-1.5 !text-[11px]" onClick={() => removeRow(idx)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </SecondaryButton>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-1">
                <Label>Defect Type</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  value={row.DefectType}
                  onChange={(e) => updateRow(idx, { DefectType: e.target.value as "Critical" | "Major" | "Minor" })}
                >
                  <option value="Critical">Critical</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <Label>Defect Category</Label>
                <Input value={row.DefectCategory} onChange={(e) => updateRow(idx, { DefectCategory: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Defect Description</Label>
                <Input value={row.DefectDescription} onChange={(e) => updateRow(idx, { DefectDescription: e.target.value })} />
              </div>
              <div className="md:col-span-1">
                <Label>Affected Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={row.AffectedQuantity}
                  onChange={(e) => updateRow(idx, { AffectedQuantity: Math.max(1, Number(e.target.value) || 1) })}
                />
              </div>
            </div>
            <div className="mt-3">
              <div className="md:max-w-[70%]">
                <Label>Remarks</Label>
                <Textarea value={row.Remarks ?? ""} onChange={(e) => updateRow(idx, { Remarks: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
