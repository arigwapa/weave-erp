import { AlertTriangle, Clock3, Factory, GitPullRequestArrow } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function DashboardPage() {
  const runThroughputTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Planned Units",
            data: [320, 340, 360, 355, 380, 300, 290],
            borderColor: "#06b6d4",
            pointBackgroundColor: "#0891b2",
            backgroundColor: "rgba(6,182,212,0.10)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.2,
          },
          {
            label: "Completed Units",
            data: [302, 333, 351, 344, 372, 294, 286],
            borderColor: "#4f46e5",
            pointBackgroundColor: "#4338ca",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.5,
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

  const delayRootCauseChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Material", "Machine", "Manpower", "QA Hold", "Power/Utility"],
        datasets: [
          {
            label: "Delayed Runs",
            data: [5, 3, 2, 2, 1],
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Production Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Live production visibility for approved versions, run health, delay causes, and throughput.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Production runs with unresolved delay causes must include mitigation owner and revised ETA before shift close.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Waiting for Production"
          value="16"
          icon={GitPullRequestArrow}
          colorTheme="indigo"
          trend="+5.2%"
          trendUp
          subText="Approved versions queued"
        />
        <DashboardStatsCard
          title="In-Progress Runs"
          value="11"
          icon={Factory}
          colorTheme="blue"
          trend="+1.3%"
          trendUp
          subText="Across active lines"
        />
        <DashboardStatsCard
          title="Delayed Runs"
          value="4"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-2.7%"
          trendUp={false}
          subText="Requires intervention"
        />
        <DashboardStatsCard
          title="Weekly Throughput"
          value="2,184"
          icon={Clock3}
          colorTheme="emerald"
          trend="+9.4%"
          trendUp
          subText="Units completed"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Planned vs Completed Throughput</CardTitle>
            <CardDescription>Daily production output trend for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={runThroughputTrendChartUrl}
              alt="Planned versus completed throughput trend chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Delay Root Cause Distribution</CardTitle>
            <CardDescription>Most frequent bottlenecks impacting on-time production runs.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={delayRootCauseChartUrl}
              alt="Delay root cause distribution chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">In-Progress Runs by Status</CardTitle>
            <CardDescription>Real-time production status mix.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Planned", 5, "Planned"],
              ["Active", 11, "In Progress"],
              ["Paused", 2, "On Hold"],
            ].map(([label, count, status]) => (
              <div key={String(label)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                  <StatusBadge status={String(status)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Delayed Runs Root Causes</CardTitle>
            <CardDescription>Delay categories to prioritize corrective action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Material shortage", "2 runs"],
              ["Machine issue", "1 run"],
              ["Manpower issue", "1 run"],
            ].map(([cause, value]) => (
              <div key={String(cause)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{cause}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operational Note</p>
        <p className="mt-1 text-sm text-slate-700">
          Prioritize lines with material-related delays first, since they account for most blocked runs this week.
        </p>
      </div>
    </div>
  );
}
