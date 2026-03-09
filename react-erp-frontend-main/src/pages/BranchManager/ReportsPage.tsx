import { useState } from "react";
import { AlertTriangle, Download, PackageSearch, Truck } from "lucide-react";
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

  const restockSlaTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "On-Time Requests",
            data: [82, 84, 80, 86, 88, 90, 87],
            borderColor: "#4f46e5",
            pointBackgroundColor: "#4338ca",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.4,
          },
          {
            label: "Delayed Requests",
            data: [18, 16, 20, 14, 12, 10, 13],
            borderColor: "#06b6d4",
            pointBackgroundColor: "#0891b2",
            backgroundColor: "rgba(6,182,212,0.10)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
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
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.22)" }, ticks: { color: "#64748b" } },
          x: { grid: { display: false }, ticks: { color: "#64748b" } },
        },
      },
    }),
  )}`;

  const discrepancySummaryChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Missing Units", "Damaged Units", "Wrong SKU", "Qty Variance"],
        datasets: [
          {
            label: "Discrepancy Cases",
            data: [11, 8, 4, 6],
            backgroundColor: ["#4f46e5", "#0ea5e9", "#22d3ee", "#818cf8"],
            borderColor: ["#4338ca", "#0284c7", "#0891b2", "#6366f1"],
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
          <h1 className="text-2xl font-semibold text-slate-900">Branch Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Branch inventory, request fulfillment, and receiving discrepancy reporting.
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
          Reports should use finalized request and receiving records with discrepancy tags and ETA outcomes.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Reports Generated"
          value="64"
          icon={Download}
          colorTheme="indigo"
          trend="+5.4%"
          trendUp
          subText="Current month"
        />
        <DashboardStatsCard
          title="SLA On-Time"
          value="87%"
          icon={Truck}
          colorTheme="blue"
          trend="+2.1%"
          trendUp
          subText="Restock requests"
        />
        <DashboardStatsCard
          title="Discrepancy Cases"
          value="29"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-1.7%"
          trendUp={false}
          subText="Receiving logs"
        />
        <DashboardStatsCard
          title="Open Requests"
          value="18"
          icon={PackageSearch}
          colorTheme="emerald"
          trend="+1.3%"
          trendUp
          subText="Awaiting closure"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Restock SLA Trend</CardTitle>
            <CardDescription>7-day on-time versus delayed request pattern.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={restockSlaTrendChartUrl}
              alt="Restock SLA trend chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Receiving Discrepancy Summary</CardTitle>
            <CardDescription>Branch-level discrepancy category distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={discrepancySummaryChartUrl}
              alt="Receiving discrepancy summary chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Report Catalog</CardTitle>
          <CardDescription>Generate branch-level operational and exception reporting outputs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            ["Low Stock Urgency Report", "SKU risk and days-of-cover", "Ready"],
            ["Restock Request SLA Report", "ETA compliance and delay reasons", "Ready"],
            ["Receiving Discrepancy Report", "Missing/damaged unit summary", "Ready"],
            ["Transfer Completion Report", "Confirmed receipts and open incoming records", "Draft"],
          ].map(([name, detail, status]) => (
            <div key={String(name)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">{detail}</p>
              </div>
              <StatusBadge status={String(status)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Report Notes</CardTitle>
          <CardDescription>Operational context and branch communication highlights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700">
            SLA status improved this week due to faster request approval turnaround.
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Two discrepancy cases remain open and require warehouse reconciliation.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
