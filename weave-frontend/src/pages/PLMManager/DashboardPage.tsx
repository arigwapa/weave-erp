import { Boxes, Clock3, FolderKanban, RefreshCcw, Wallet } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function DashboardPage() {
  const revisionTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Submitted Drafts",
            data: [10, 12, 9, 14, 11, 8, 13],
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointBackgroundColor: "#4338ca",
            borderWidth: 2.5,
          },
          {
            label: "Returned for Revision",
            data: [4, 5, 3, 6, 4, 3, 5],
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6,182,212,0.08)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            pointBackgroundColor: "#0891b2",
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

  const bomCostBarChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Cotton Twill", "Metal Zipper", "Poly Lining", "Elastic Tape", "Thread"],
        datasets: [
          {
            label: "Cost (PHP, x1000)",
            data: [320, 170, 142, 108, 94],
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
          <h1 className="text-2xl font-semibold text-slate-900">Product Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Phase 2 originator view for collection readiness, revision pressure, and BOM cost signals.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Collections with repeated rejects should include cost-impact notes before next submission.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Draft Collections"
          value="18"
          icon={FolderKanban}
          colorTheme="indigo"
          trend="+3.4%"
          trendUp
          subText="Active season drafts"
        />
        <DashboardStatsCard
          title="Pending Finance Review"
          value="9"
          icon={Clock3}
          colorTheme="blue"
          trend="+1.6%"
          trendUp
          subText="Awaiting stage handoff"
        />
        <DashboardStatsCard
          title="Rejected Items"
          value="6"
          icon={RefreshCcw}
          colorTheme="cyan"
          trend="-4.2%"
          trendUp={false}
          subText="Requires revision"
        />
        <DashboardStatsCard
          title="Most Revised Products"
          value="4"
          icon={Boxes}
          colorTheme="emerald"
          trend="+12.0%"
          trendUp
          subText="3+ revisions each"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Revision Flow Trend</CardTitle>
            <CardDescription>Weekly draft submissions versus items returned for revision.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={revisionTrendChartUrl}
              alt="Revision flow line chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">BOM Cost Distribution</CardTitle>
            <CardDescription>Top material categories by total BOM cost impact.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={bomCostBarChartUrl}
              alt="BOM cost bar chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Average Turnaround</CardTitle>
            <CardDescription>Draft to approved processing time by collection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["SS26", "4.8 days"],
              ["Resort 26", "5.3 days"],
              ["Holiday 26", "6.1 days"],
            ].map(([season, value]) => (
              <div key={String(season)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{season}</span>
                <span className="text-sm font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Top BOM Cost Drivers</CardTitle>
            <CardDescription>Materials with highest cost impact across active products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Organic Cotton Twill", "PHP 320,000", "24%"],
              ["YKK Metal Zipper", "PHP 170,000", "13%"],
              ["Poly Lining Premium", "PHP 142,000", "11%"],
            ].map(([material, cost, share]) => (
              <div key={String(material)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{material}</p>
                  <p className="text-xs text-slate-500">Cost contribution {share}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Wallet size={14} className="text-indigo-500" />
                  {cost}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
