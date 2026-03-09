import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function ReportsPage() {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Approval throughput, SLA health, and risk trend reports for operational governance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            Generate Report
          </PrimaryButton>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "pdf" | "excel")}>
            <SelectTrigger className="!h-10 !w-[160px] !rounded-full !border-slate-200 !text-xs !font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Export PDF</SelectItem>
              <SelectItem value="excel">Export Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Approval Governance Reports</CardTitle>
          <CardDescription>Operational and compliance reporting for gate ownership decisions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Approval SLA Performance", "Last 30 days", "Ready"],
            ["Rejection Reason Analysis", "By module and branch", "Ready"],
            ["Stock Risk vs Approval Delay", "Risk correlation dashboard", "Draft"],
          ].map(([name, subtitle, state]) => (
            <div
              key={String(name)}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>
              <StatusBadge status={String(state)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
