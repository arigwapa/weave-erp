import { useState } from "react";
import { AlertTriangle, ClipboardCheck, Download, Factory } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
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

  const throughputTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Planned Output",
            data: [980, 1120, 1180, 1200, 1260, 940, 880],
            borderColor: "#06b6d4",
            pointBackgroundColor: "#0891b2",
            backgroundColor: "rgba(6,182,212,0.10)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.2,
          },
          {
            label: "Actual Output",
            data: [940, 1080, 1140, 1175, 1210, 910, 845],
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

  const rootCauseChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Material", "Machine", "Manpower", "QA Return", "Planning"],
        datasets: [
          {
            label: "Delay Cases",
            data: [14, 9, 7, 5, 4],
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
          <h1 className="text-2xl font-semibold text-slate-900">Production Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Production throughput, delay root-cause, and QA handoff effectiveness reporting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            Generate Report
          </PrimaryButton>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "pdf" | "excel")}>
            <SelectTrigger className="!h-10 !w-[170px] !rounded-full !border-slate-200 !bg-white !text-xs !font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
              <SelectItem className="rounded-lg py-2" value="pdf">
                Export PDF
              </SelectItem>
              <SelectItem className="rounded-lg py-2" value="excel">
                Export Excel
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Reports should use finalized run/batch records and include the latest QA handoff outcome tags.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Reports Generated"
          value="124"
          icon={Download}
          colorTheme="indigo"
          trend="+6.2%"
          trendUp
          subText="Current month"
        />
        <DashboardStatsCard
          title="Avg Throughput"
          value="1,042"
          icon={Factory}
          colorTheme="blue"
          trend="+2.8%"
          trendUp
          subText="Units per day"
        />
        <DashboardStatsCard
          title="Delay Incidents"
          value="39"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-3.4%"
          trendUp={false}
          subText="Weekly trend"
        />
        <DashboardStatsCard
          title="QA Return Cases"
          value="8"
          icon={ClipboardCheck}
          colorTheme="emerald"
          trend="-1.1%"
          trendUp={false}
          subText="Handoff loopback"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Planned vs Actual Throughput</CardTitle>
            <CardDescription>7-day production velocity trend against plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={throughputTrendChartUrl}
              alt="Planned versus actual throughput chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Delay Root Cause Distribution</CardTitle>
            <CardDescription>Material, machine, manpower, and QA-related delay patterns.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={rootCauseChartUrl}
              alt="Delay root cause distribution chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Report Catalog</CardTitle>
          <CardDescription>Operational reporting outputs for production performance tracking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Daily/Weekly Throughput", "Production velocity and completion trends", "Ready"],
            ["Delay Root-Cause Analysis", "Material/machine/manpower breakdown", "Ready"],
            ["QA Handoff Return Rate", "Batch failure return trend", "Draft"],
          ].map(([name, desc, status]) => (
            <div key={String(name)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <StatusBadge status={String(status)} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
