import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ClipboardCheck,
  Download,
  Factory,
  FileText,
  ShieldCheck,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import ReportCard from "../../components/ui/ReportCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { productionQueueApi, type ProductionQueueItem } from "../../lib/api/productionQueueApi";
import { productionLogApi, type ProductionLog } from "../../lib/api/productionLogApi";
import { inspectionApi, type InspectionHistoryItem } from "../../lib/api/inspectionApi";
import { generateExecutiveReport } from "../../lib/analyticsApi";

type ThroughputPoint = {
  day: string;
  planned: number;
  actual: number;
};

type RootCausePoint = {
  cause: string;
  count: number;
};

const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const shortDay = (date: Date): string =>
  date.toLocaleString("en-US", { weekday: "short" });

export default function ReportsPage() {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [queueRows, setQueueRows] = useState<ProductionQueueItem[]>([]);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [inspections, setInspections] = useState<InspectionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [queueData, logsData, inspectionData] = await Promise.all([
          productionQueueApi.list(),
          productionLogApi.list(),
          inspectionApi.listHistory(),
        ]);
        setQueueRows(queueData ?? []);
        setLogs(logsData ?? []);
        setInspections(inspectionData ?? []);
      } catch (error) {
        setQueueRows([]);
        setLogs([]);
        setInspections([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load production report data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const reportsGenerated = useMemo(() => {
    const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const qaEvents = inspections.filter((item) => {
      const at = toDate(item.InspectionDate || item.CreatedAt);
      return !!at && at.getTime() >= last30Days;
    }).length;
    const logEvents = logs.filter((item) => {
      const at = toDate(item.LogDate);
      return !!at && at.getTime() >= last30Days;
    }).length;
    return qaEvents + logEvents;
  }, [inspections, logs]);

  const avgThroughput = useMemo(() => {
    const today = new Date();
    const days = new Set<string>();
    for (let i = 0; i < 7; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.add(dayKey(d));
    }
    const totalOutput = logs.reduce((sum, row) => {
      const at = toDate(row.LogDate);
      if (!at || !days.has(dayKey(at))) return sum;
      return sum + (row.OutputQty ?? 0);
    }, 0);
    return Math.round(totalOutput / 7);
  }, [logs]);

  const delayIncidents = useMemo(() => {
    const now = Date.now();
    return queueRows.filter((row) => {
      const due = toDate(row.DueDate);
      if (!due) return false;
      const isCompleted = (row.QueueStatus || "").toLowerCase() === "completed";
      return !isCompleted && due.getTime() < now;
    }).length;
  }, [queueRows]);

  const qaReturnCases = useMemo(
    () =>
      inspections.filter((item) => {
        const result = (item.Result || "").trim().toLowerCase();
        return result.includes("reject") || result.includes("review") || result.includes("fail");
      }).length,
    [inspections],
  );

  const throughputTrendData = useMemo<ThroughputPoint[]>(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { key: dayKey(date), label: shortDay(date) };
    });
    const plannedMap = new Map(days.map((d) => [d.key, 0]));
    const actualMap = new Map(days.map((d) => [d.key, 0]));

    queueRows.forEach((item) => {
      const due = toDate(item.DueDate);
      if (!due) return;
      const key = dayKey(due);
      if (!plannedMap.has(key)) return;
      plannedMap.set(key, (plannedMap.get(key) ?? 0) + (item.PlannedQty ?? 0));
    });

    logs.forEach((item) => {
      const at = toDate(item.LogDate);
      if (!at) return;
      const key = dayKey(at);
      if (!actualMap.has(key)) return;
      actualMap.set(key, (actualMap.get(key) ?? 0) + (item.OutputQty ?? 0));
    });

    return days.map((d) => ({
      day: d.label,
      planned: plannedMap.get(d.key) ?? 0,
      actual: actualMap.get(d.key) ?? 0,
    }));
  }, [queueRows, logs]);

  const rootCauseData = useMemo<RootCausePoint[]>(() => {
    const buckets = new Map<string, number>([
      ["Material", 0],
      ["Machine", 0],
      ["Manpower", 0],
      ["QA Return", 0],
      ["Planning", 0],
    ]);
    const now = Date.now();

    queueRows.forEach((item) => {
      const due = toDate(item.DueDate);
      if (!due) return;
      const delayed = due.getTime() < now && (item.QueueStatus || "").toLowerCase() !== "completed";
      if (!delayed) return;

      const readiness = (item.Readiness || "").toLowerCase();
      if (readiness.includes("material")) buckets.set("Material", (buckets.get("Material") ?? 0) + 1);
      else if (readiness.includes("machine")) buckets.set("Machine", (buckets.get("Machine") ?? 0) + 1);
      else if (readiness.includes("manpower") || readiness.includes("operator")) buckets.set("Manpower", (buckets.get("Manpower") ?? 0) + 1);
      else if (readiness.includes("qa") || readiness.includes("quality")) buckets.set("QA Return", (buckets.get("QA Return") ?? 0) + 1);
      else buckets.set("Planning", (buckets.get("Planning") ?? 0) + 1);
    });

    return Array.from(buckets.entries()).map(([cause, count]) => ({ cause, count }));
  }, [queueRows]);

  const catalogItems = useMemo(
    () => [
      {
        name: "Daily/Weekly Throughput",
        desc: `${avgThroughput.toLocaleString()} avg units/day over last 7 days.`,
        status: "Ready",
      },
      {
        name: "Delay Root-Cause Analysis",
        desc: `${delayIncidents} active delay incident(s) in current queue.`,
        status: delayIncidents > 0 ? "Needs Review" : "Ready",
      },
      {
        name: "QA Handoff Return Rate",
        desc: `${qaReturnCases} return/review case(s) captured in QA history.`,
        status: qaReturnCases > 0 ? "At Risk" : "Healthy",
      },
    ],
    [avgThroughput, delayIncidents, qaReturnCases],
  );

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAnalysisError(null);
    try {
      const focus = [
        "Generate an executive analysis for production reports.",
        `Reports Generated (last 30 days): ${reportsGenerated}.`,
        `Average Throughput (7 days): ${avgThroughput}.`,
        `Delay Incidents: ${delayIncidents}.`,
        `QA Return Cases: ${qaReturnCases}.`,
        "Cover insights from KPI cards, throughput trend, root cause distribution, and report catalog.",
      ].join(" ");

      const result = await generateExecutiveReport(undefined, undefined, focus);
      setGeneratedAnalysis(result.reportText || "No analysis generated.");
    } catch (error) {
      setGeneratedAnalysis("");
      setAnalysisError(error instanceof Error ? error.message : "Failed to generate report analysis.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Production Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Production throughput, delay root-cause, and QA handoff effectiveness reporting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              isLoading={isGenerating}
              onClick={() => void handleGenerateReport()}
            >
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
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Reports should use finalized run/batch records and include the latest QA handoff outcome tags.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Reports Generated"
          value={isLoading ? "..." : reportsGenerated.toLocaleString()}
          icon={Download}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Current month"
        />
        <DashboardStatsCard
          title="Avg Throughput"
          value={isLoading ? "..." : avgThroughput.toLocaleString()}
          icon={Factory}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Units per day"
        />
        <DashboardStatsCard
          title="Delay Incidents"
          value={isLoading ? "..." : delayIncidents.toLocaleString()}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Weekly trend"
        />
        <DashboardStatsCard
          title="QA Return Cases"
          value={isLoading ? "..." : qaReturnCases.toLocaleString()}
          icon={ClipboardCheck}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Handoff loopback"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ReportCard title="Planned vs Actual Throughput" icon={FileText} exportLabel="Export Chart">
          <p className="mb-3 text-xs text-slate-500">7-day production velocity trend against plan.</p>
          <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputTrendData}>
                <defs>
                  <linearGradient id="productionActualArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" name="Planned Output" stroke="#06b6d4" strokeWidth={2.3} dot={{ r: 3 }} />
                <Area type="monotone" dataKey="actual" fill="url(#productionActualArea)" stroke="none" />
                <Line type="monotone" dataKey="actual" name="Actual Output" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>

        <ReportCard title="Delay Root Cause Distribution" icon={ShieldCheck} exportLabel="Export Chart">
          <p className="mb-3 text-xs text-slate-500">Material, machine, manpower, and QA-related delay patterns.</p>
          <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rootCauseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="cause" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="count" name="Delay Cases" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>
      </section>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Report Catalog</CardTitle>
          <CardDescription>Operational reporting outputs for production performance tracking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {catalogItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Generated Analysis</CardTitle>
          <CardDescription>
            AI-generated narrative summary across production throughput, delays, QA loopbacks, and catalog health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {analysisError}
            </div>
          ) : generatedAnalysis ? (
            <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
              {generatedAnalysis}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
              Click <span className="font-semibold text-slate-700">Generate Report</span> to create AI analysis.
            </div>
          )}
        </CardContent>
      </Card>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to load full report data: {loadError}
        </div>
      ) : null}
    </div>
  );
}
