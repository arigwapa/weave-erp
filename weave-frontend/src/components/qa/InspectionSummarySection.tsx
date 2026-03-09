import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { SaveInspectionDefectDto } from "../../lib/api/inspectionApi";

type Props = {
  defects: SaveInspectionDefectDto[];
  sampleSize: number;
  acceptThreshold: number;
  rejectThreshold: number;
};

function countByType(defects: SaveInspectionDefectDto[], type: "Critical" | "Major" | "Minor"): number {
  return defects
    .filter((x) => x.DefectType === type)
    .reduce((sum, x) => sum + Math.max(0, Number(x.AffectedQuantity) || 0), 0);
}

export function InspectionSummarySection({ defects, sampleSize, acceptThreshold, rejectThreshold }: Props) {
  const totalCritical = countByType(defects, "Critical");
  const totalMajor = countByType(defects, "Major");
  const totalMinor = countByType(defects, "Minor");
  const totalDefects = totalCritical + totalMajor + totalMinor;
  const defectRate = sampleSize > 0 ? ((totalDefects / sampleSize) * 100).toFixed(2) : "0.00";
  const result =
    totalDefects <= acceptThreshold
      ? "Accepted"
      : totalDefects >= rejectThreshold
        ? "Rejected"
        : "Review Required";

  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Section 6 - Computed Summary</h4>
      <p className="mb-3 text-xs text-slate-500">Result preview based on defect totals and thresholds.</p>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label>Total Critical Defects</Label>
          <Input value={String(totalCritical)} readOnly className="bg-slate-50" />
        </div>
        <div>
          <Label>Total Major Defects</Label>
          <Input value={String(totalMajor)} readOnly className="bg-slate-50" />
        </div>
        <div>
          <Label>Total Minor Defects</Label>
          <Input value={String(totalMinor)} readOnly className="bg-slate-50" />
        </div>
        <div>
          <Label>Total Defects Found</Label>
          <Input value={String(totalDefects)} readOnly className="bg-slate-50" />
        </div>
        <div>
          <Label>Defect Rate</Label>
          <Input value={`${defectRate}%`} readOnly className="bg-slate-50" />
        </div>
        <div>
          <Label>Result Preview</Label>
          <Input value={result} readOnly className="bg-slate-50" />
        </div>
      </div>
    </section>
  );
}
