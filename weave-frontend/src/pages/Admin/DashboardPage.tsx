import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  PackageX,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function DashboardPage() {
  const approvalTrendLineChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Pending Approvals",
            data: [32, 29, 35, 31, 27, 24, 21],
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 4,
            pointBackgroundColor: "#4338ca",
            borderWidth: 2.5,
          },
          {
            label: "Resolved Approvals",
            data: [18, 22, 20, 24, 26, 29, 31],
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6,182,212,0.10)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            pointHoverRadius: 4,
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

  const moduleBacklogBarChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["BOM", "Budget", "QA Release", "Warehouse", "Overrides"],
        datasets: [
          {
            label: "Open Backlog",
            data: [14, 9, 11, 7, 6],
            backgroundColor: ["#4f46e5", "#0ea5e9", "#22d3ee", "#818cf8", "#60a5fa"],
            borderColor: ["#4338ca", "#0284c7", "#0891b2", "#6366f1", "#3b82f6"],
            borderWidth: 1.2,
            borderRadius: 10,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
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
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Approval Gate Owner overview for approval risk, inventory pressure, and quality severity.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="BOM Pending"
          value="14"
          icon={Boxes}
          colorTheme="indigo"
          trend="+6.1%"
          trendUp
          subText="Awaiting approval"
        />
        <DashboardStatsCard
          title="Budget Pending"
          value="9"
          icon={Wallet}
          colorTheme="blue"
          trend="+2.0%"
          trendUp
          subText="Finance gate queue"
        />
        <DashboardStatsCard
          title="QA Release Pending"
          value="11"
          icon={ClipboardCheck}
          colorTheme="cyan"
          trend="-4.5%"
          trendUp={false}
          subText="Ready for disposition"
        />
        <DashboardStatsCard
          title="SLA Breaches"
          value="7"
          icon={AlertTriangle}
          colorTheme="emerald"
          trend="+1.8%"
          trendUp
          subText="Aging approvals"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Approval Throughput Trend</CardTitle>
            <CardDescription>7-day view of pending versus resolved approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={approvalTrendLineChartUrl}
              alt="Approval throughput line chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Backlog by Module</CardTitle>
            <CardDescription>Current open approval queue distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={moduleBacklogBarChartUrl}
              alt="Module backlog bar chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Collections at Risk</CardTitle>
            <CardDescription>Collections with multiple rejections or repeated return loops.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["CO-2026-014", "3 rejections", "At Risk"],
              ["CO-2026-019", "2 rejections", "Pending"],
              ["CO-2026-022", "4 rejections", "Critical"],
            ].map(([collection, reason, status]) => (
              <div
                key={String(collection)}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{collection}</p>
                  <p className="text-xs text-slate-500">{reason}</p>
                </div>
                <StatusBadge status={String(status)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Stock Risk & High Severity Defects</CardTitle>
            <CardDescription>Branches with low stock and recent high-severity QA defects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Cebu Hub", "Low stock probability: 82%", "At Risk"],
              ["Davao South", "Stockout probability: 91%", "Critical"],
              ["Manila Central", "QA Defect: Adhesive failure", "High"],
              ["Iloilo", "QA Defect: Stitching mismatch", "High"],
            ].map(([name, info, status]) => (
              <div
                key={String(name) + String(info)}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <div className="flex items-start gap-2">
                  <PackageX size={16} className="mt-0.5 text-rose-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{info}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-amber-500" />
                  <StatusBadge status={String(status)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
