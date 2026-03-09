import { AlertTriangle, TrendingUp, Wallet, Scale } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function VarianceAnalyticsPage() {
  const varianceTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["SS25", "Holiday 25", "Resort 26", "SS26", "Holiday 26", "Resort 27"],
        datasets: [
          {
            label: "Variance %",
            data: [3.2, 1.4, 6.9, -2.1, 2.8, 1.2],
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointBackgroundColor: "#4338ca",
            borderWidth: 2.5,
          },
          {
            label: "Threshold %",
            data: [4, 4, 4, 4, 4, 4],
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6,182,212,0.08)",
            fill: false,
            tension: 0.2,
            pointRadius: 0,
            borderWidth: 2.2,
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

  const budgetEstimateActualChartUrl = `https://quickchart.io/chart?width=900&height=340&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["SS26 Core", "Holiday 26", "Resort 26"],
        datasets: [
          {
            label: "Budget (PHP M)",
            data: [9.1, 7.8, 6.5],
            backgroundColor: "#4f46e5",
            borderColor: "#4338ca",
            borderWidth: 1.2,
            borderRadius: 8,
          },
          {
            label: "Estimated (PHP M)",
            data: [8.41, 7.64, 6.88],
            backgroundColor: "#0ea5e9",
            borderColor: "#0284c7",
            borderWidth: 1.2,
            borderRadius: 8,
          },
          {
            label: "Actual (PHP M)",
            data: [8.62, 0, 6.95],
            backgroundColor: "#22d3ee",
            borderColor: "#0891b2",
            borderWidth: 1.2,
            borderRadius: 8,
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
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.22)" }, ticks: { color: "#64748b" } },
          x: { grid: { display: false }, ticks: { color: "#64748b" } },
        },
      },
    }),
  )}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Variance Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare budget, estimated, and post-production actuals with trend tracking by season and collection.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Collections above variance threshold must include corrective finance notes before next approval stage.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Collections Tracked"
          value="18"
          icon={Scale}
          colorTheme="indigo"
          trend="+2.8%"
          trendUp
          subText="Active in current cycle"
        />
        <DashboardStatsCard
          title="Within Budget"
          value="11"
          icon={Wallet}
          colorTheme="blue"
          trend="+1.6%"
          trendUp
          subText="Below approved cap"
        />
        <DashboardStatsCard
          title="Over Budget"
          value="4"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-0.9%"
          trendUp={false}
          subText="Need mitigation plan"
        />
        <DashboardStatsCard
          title="Average Variance"
          value="+2.4%"
          icon={TrendingUp}
          colorTheme="emerald"
          trend="+0.4%"
          trendUp
          subText="Across tracked collections"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Budget vs Estimated vs Actual</CardTitle>
            <CardDescription>Collection-level cost comparison in PHP millions.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={budgetEstimateActualChartUrl}
              alt="Budget estimated actual bar chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Variance Trend Over Time</CardTitle>
            <CardDescription>Seasonal variance movement against threshold baseline.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={varianceTrendChartUrl}
              alt="Variance trend line chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Variance Breakdown</CardTitle>
          <CardDescription>Post-production actuals shown where available.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["SS26 Core", "Budget 9.10M", "Estimated 8.41M", "Actual 8.62M", "Within Budget"],
            ["Holiday 26", "Budget 7.80M", "Estimated 7.64M", "Actual N/A", "On Track"],
            ["Resort 26", "Budget 6.50M", "Estimated 6.88M", "Actual 6.95M", "Over Budget"],
          ].map(([name, budget, estimated, actual, status]) => (
            <div key={String(name)} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{name}</p>
                <StatusBadge status={String(status)} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {budget} • {estimated} • {actual}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
