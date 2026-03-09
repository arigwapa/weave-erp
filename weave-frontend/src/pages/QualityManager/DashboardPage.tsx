import { AlertTriangle, Boxes, Bug, RefreshCcw } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">QA Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Phase 5 quality gate overview for inspection workload, quality outcomes, and defect risk.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Pending Inspection"
          value="27"
          icon={Boxes}
          colorTheme="indigo"
          trend="+4.0%"
          trendUp
          subText="Batches waiting"
        />
        <DashboardStatsCard
          title="Pass Rate"
          value="93.2%"
          icon={RefreshCcw}
          colorTheme="emerald"
          trend="+1.2%"
          trendUp
          subText="By collection/version"
        />
        <DashboardStatsCard
          title="Fail Rate"
          value="6.8%"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-0.8%"
          trendUp={false}
          subText="Current cycle"
        />
        <DashboardStatsCard
          title="Rework Loops"
          value="14"
          icon={Bug}
          colorTheme="blue"
          trend="+2.9%"
          trendUp
          subText="Per product"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Defect Distribution</CardTitle>
            <CardDescription>Defect split by severity and type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Critical", "Material tear", "4"],
              ["High", "Stitching mismatch", "11"],
              ["Medium", "Dimension variance", "18"],
              ["Low", "Label alignment", "23"],
            ].map(([severity, type, count]) => (
              <div key={String(severity) + String(type)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{type}</p>
                  <p className="text-xs text-slate-500">{severity}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Pass/Fail by Collection Version</CardTitle>
            <CardDescription>Current quality gate outcome snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["CO-2026-022 / V3", "Pass"],
              ["CO-2026-031 / V2", "Fail"],
              ["CO-2026-018 / V4", "Pass"],
            ].map(([label, status]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{label}</span>
                <StatusBadge status={String(status)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
