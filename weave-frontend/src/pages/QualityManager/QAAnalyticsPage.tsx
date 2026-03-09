import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function QAAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">QA Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Trend analysis for fail rates, branch variation, and repeated defect early warnings.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Fail Rate Trends</CardTitle>
          <CardDescription>By version and by branch over recent runs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["CO-2026-022 / V3", "5.9%", "Manila"],
            ["CO-2026-031 / V2", "8.1%", "Cebu"],
            ["CO-2026-018 / V4", "6.7%", "Davao"],
          ].map(([label, rate, branch]) => (
            <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-500">{branch}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{rate}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Early Warning Signals</CardTitle>
          <CardDescription>Repeated defect patterns across production runs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Stitching mismatch", "Repeated in 4 runs", "At Risk"],
            ["Label alignment drift", "Repeated in 3 runs", "Review"],
            ["Material shade inconsistency", "Repeated in 2 runs", "Pending"],
          ].map(([type, detail, status]) => (
            <div key={String(type)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{type}</p>
                <p className="text-xs text-slate-500">{detail}</p>
              </div>
              <StatusBadge status={String(status)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
