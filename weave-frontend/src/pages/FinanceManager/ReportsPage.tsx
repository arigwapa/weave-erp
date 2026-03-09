import { useState } from "react";
import { Download, FileBarChart2, FileText, Filter, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function ReportsPage() {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const reportVolumeTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Generated Reports",
            data: [24, 31, 29, 35, 38, 42],
            borderColor: "#4f46e5",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            pointBackgroundColor: "#4338ca",
            borderWidth: 2.5,
          },
          {
            label: "Exported Reports",
            data: [16, 20, 22, 25, 27, 31],
            borderColor: "#06b6d4",
            backgroundColor: "rgba(6,182,212,0.08)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            pointBackgroundColor: "#0891b2",
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

  const reportTypeMixChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Cost Breakdown", "Budget Throughput", "Variance", "Forecast", "Compliance"],
        datasets: [
          {
            label: "Report Runs",
            data: [44, 38, 32, 26, 19],
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
          <h1 className="text-2xl font-semibold text-slate-900">Finance Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Costing, budget approval, and variance reports for financial governance and planning.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Published reports must reference approved collection data snapshots and include timestamped export metadata.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Reports Generated"
          value="198"
          icon={FileBarChart2}
          colorTheme="indigo"
          trend="+8.4%"
          trendUp
          subText="Current quarter"
        />
        <DashboardStatsCard
          title="Exports Completed"
          value="141"
          icon={Download}
          colorTheme="blue"
          trend="+5.1%"
          trendUp
          subText="PDF and XLSX"
        />
        <DashboardStatsCard
          title="Avg Build Time"
          value="48s"
          icon={TrendingUp}
          colorTheme="emerald"
          trend="-7.2%"
          trendUp={false}
          subText="End-to-end runtime"
        />
        <DashboardStatsCard
          title="Draft Reports"
          value="12"
          icon={FileText}
          colorTheme="cyan"
          trend="+1.3%"
          trendUp
          subText="Awaiting review"
        />
      </section>

      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">Report Catalog</CardTitle>
            <CardDescription>Generate role-focused reports for finance approvals and trends.</CardDescription>
          </div>
          <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as "pdf" | "excel")}>
            <SelectTrigger className="!h-10 !w-[170px] !rounded-full !border-slate-200 !bg-white !text-xs !font-semibold !shadow-sm">
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
            <Select defaultValue="monthly">
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all focus-visible:border-sky-200">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                <SelectItem className="rounded-lg py-2" value="weekly">
                  Weekly
                </SelectItem>
                <SelectItem className="rounded-lg py-2" value="monthly">
                  Monthly
                </SelectItem>
                <SelectItem className="rounded-lg py-2" value="quarterly">
                  Quarterly
                </SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-collections">
              <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white/90 shadow-sm transition-all focus-visible:border-sky-200">
                <SelectValue placeholder="Collection scope" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                <SelectItem className="rounded-lg py-2" value="all-collections">
                  All Collections
                </SelectItem>
                <SelectItem className="rounded-lg py-2" value="ss26-core">
                  SS26 Core
                </SelectItem>
                <SelectItem className="rounded-lg py-2" value="holiday-26">
                  Holiday 26
                </SelectItem>
                <SelectItem className="rounded-lg py-2" value="resort-26">
                  Resort 26
                </SelectItem>
              </SelectContent>
            </Select>
            <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
              Generate
            </PrimaryButton>
            <SecondaryButton icon={Filter}>Advanced Filter</SecondaryButton>
          </div>

          {[
            ["Collection Cost Breakdown", "By size/product/collection", "Ready"],
            ["Budget Approval Throughput", "SLA and decision cycle", "Ready"],
            ["Variance Trend Dashboard", "Season over season", "Draft"],
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

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Report Generation Trend</CardTitle>
            <CardDescription>Generated versus exported report volume by month.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={reportVolumeTrendChartUrl}
              alt="Report generation trend chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Report Type Mix</CardTitle>
            <CardDescription>Most frequently generated report categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={reportTypeMixChartUrl}
              alt="Report type mix bar chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
