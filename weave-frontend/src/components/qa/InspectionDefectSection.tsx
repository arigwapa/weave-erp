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
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 4 - Defect Details</h4>
      <p className="mb-3 text-xs text-slate-500">Add one row per defect type/category and quantity observed.</p>
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 p-3">
            <div className="grid gap-3 md:grid-cols-5">
              <div>
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
              <div>
                <Label>Defect Category</Label>
                <Input value={row.DefectCategory} onChange={(e) => updateRow(idx, { DefectCategory: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Defect Description</Label>
                <Input value={row.DefectDescription} onChange={(e) => updateRow(idx, { DefectDescription: e.target.value })} />
              </div>
              <div>
                <Label>Affected Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={row.AffectedQuantity}
                  onChange={(e) => updateRow(idx, { AffectedQuantity: Math.max(1, Number(e.target.value) || 1) })}
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <Label>Remarks</Label>
                <Textarea value={row.Remarks ?? ""} onChange={(e) => updateRow(idx, { Remarks: e.target.value })} />
              </div>
              <div className="flex items-end">
                <SecondaryButton onClick={() => removeRow(idx)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </SecondaryButton>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add Defect Row
        </PrimaryButton>
      </div>
    </section>
  );
}
