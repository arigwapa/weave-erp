import { AlertTriangle, Boxes, Clock3, Wallet } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function DashboardPage() {
  const budgetVsSpendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        datasets: [
          {
            label: "Budget Baseline (PHP M)",
            data: [6.6, 6.8, 7.0, 7.2, 7.5, 7.8],
            borderColor: "#06b6d4",
            pointBackgroundColor: "#0891b2",
            backgroundColor: "rgba(6,182,212,0.12)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.2,
          },
          {
            label: "Actual Spend (PHP M)",
            data: [6.4, 6.9, 7.1, 7.35, 7.9, 8.1],
            borderColor: "#4f46e5",
            pointBackgroundColor: "#4338ca",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.6,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8, color: "#334155", padding: 16 },
          },
        },
        scales: {
          y: { beginAtZero: false, grid: { color: "rgba(148,163,184,0.22)" }, ticks: { color: "#64748b" } },
          x: { grid: { display: false }, ticks: { color: "#64748b" } },
        },
      },
    }),
  )}`;

  const varianceByCollectionChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["SS26 Core", "Holiday 26", "Resort 26", "Capsule A", "Capsule B"],
        datasets: [
          {
            label: "Variance % vs Plan",
            data: [9, 5, -2, 3, 7],
            backgroundColor: ["#4f46e5", "#0ea5e9", "#22d3ee", "#818cf8", "#60a5fa"],
            borderColor: ["#4338ca", "#0284c7", "#0891b2", "#6366f1", "#3b82f6"],
            borderWidth: 1.2,
            borderRadius: 10,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.22)" }, ticks: { color: "#64748b" } },
          x: { grid: { display: false }, ticks: { color: "#64748b" } },
        },
      },
    }),
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Finance Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Costing and budget approval command center with collection-level risk and variance visibility.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Variance above budget threshold should include documented justification before approval release.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Awaiting Costing"
          value="12"
          icon={Clock3}
          colorTheme="indigo"
          trend="+4.5%"
          trendUp
          subText="Collections pending costing"
        />
        <DashboardStatsCard
          title="Total BOM Cost"
          value="PHP 8.41M"
          icon={Wallet}
          colorTheme="blue"
          trend="+2.2%"
          trendUp
          subText="Across active collections"
        />
        <DashboardStatsCard
          title="Budget Utilization"
          value="86%"
          icon={Boxes}
          colorTheme="emerald"
          trend="+1.8%"
          trendUp
          subText="Current season"
        />
        <DashboardStatsCard
          title="Rejected Submissions"
          value="5"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-3.1%"
          trendUp={false}
          subText="Needs feedback-driven revision"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Budget vs Actual Spend Trend</CardTitle>
            <CardDescription>
              Weekly budget baseline against actual collection spending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={budgetVsSpendChartUrl}
              alt="Budget versus actual spend trend chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Variance by Collection</CardTitle>
            <CardDescription>
              Percentage variance versus plan across current finance scope.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={varianceByCollectionChartUrl}
              alt="Variance by collection bar chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Budget Utilization & Variance Heatmap</CardTitle>
            <CardDescription>Collection-level budget burn and variance pressure indicators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["SS26 Core", "91%", "At Risk"],
              ["Holiday 26", "84%", "Review"],
              ["Resort 26", "73%", "Good"],
            ].map(([collection, utilization, status]) => (
              <div key={String(collection)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{collection}</p>
                  <p className="text-xs text-slate-500">Utilization: {utilization}</p>
                </div>
                <StatusBadge status={String(status)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Rejected Submissions</CardTitle>
            <CardDescription>Latest rejected finance submissions with reason tags.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["CO-2026-022", "Missing wastage assumption"],
              ["CO-2026-031", "Variance above threshold"],
              ["CO-2026-018", "Insufficient cost justification"],
            ].map(([record, reason]) => (
              <div key={String(record)} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-800">{record}</p>
                <p className="mt-1 text-xs text-slate-500">Reason: {reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
