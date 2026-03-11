import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  FileText,
  ShieldCheck,
  Wallet,
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
import ReportCard from "../../components/ui/ReportCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { adminApprovalInboxApi, type AdminApprovalFinanceItem, type AdminApprovalQaItem } from "../../lib/api/adminApprovalInboxApi";
import { productionInventoryApi, type WarehouseInventoryRow } from "../../lib/api/productionInventoryApi";
import { auditLogsApi, type AuditLogEntry } from "../../lib/api/auditLogsApi";
import { generateExecutiveReport } from "../../lib/analyticsApi";

type ThroughputPoint = {
  day: string;
  pending: number;
  resolved: number;
};

type ModuleBacklogPoint = {
  module: string;
  count: number;
};

function isPendingStatus(rawStatus: string): boolean {
  const status = (rawStatus || "").trim().toLowerCase();
  if (!status) return false;
  return (
    status.includes("pending")
    || status.includes("submitted")
    || status.includes("for approval")
    || status.includes("for review")
    || status.includes("queue")
  );
}

function toDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortDay(date: Date): string {
  return date.toLocaleString("en-US", { weekday: "short" });
}

export default function ReportsPage() {
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [financeQueue, setFinanceQueue] = useState<AdminApprovalFinanceItem[]>([]);
  const [qaQueue, setQaQueue] = useState<AdminApprovalQaItem[]>([]);
  const [inventoryRows, setInventoryRows] = useState<WarehouseInventoryRow[]>([]);
  const [auditItems, setAuditItems] = useState<AuditLogEntry[]>([]);
  const [generatedAnalysis, setGeneratedAnalysis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [financeData, qaData, inventoryData, auditData] = await Promise.all([
          adminApprovalInboxApi.listFinance(),
          adminApprovalInboxApi.listQa(),
          productionInventoryApi.listWarehouseTable(),
          auditLogsApi.getBranchAdminLogs({ page: 1, pageSize: 10 }),
        ]);
        setFinanceQueue(financeData);
        setQaQueue(qaData);
        setInventoryRows(inventoryData);
        setAuditItems(auditData.Items ?? []);
      } catch (error) {
        setFinanceQueue([]);
        setQaQueue([]);
        setInventoryRows([]);
        setAuditItems([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load report data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadReports();
  }, []);

  const pendingFinanceItems = useMemo(
    () => financeQueue.filter((item) => isPendingStatus(item.Status)),
    [financeQueue],
  );
  const pendingQaItems = useMemo(
    () => qaQueue.filter((item) => isPendingStatus(item.Status)),
    [qaQueue],
  );

  const bomPending = useMemo(
    () => pendingFinanceItems.reduce((acc, item) => acc + item.Products.reduce((sum, product) => sum + product.BomLines.length, 0), 0),
    [pendingFinanceItems],
  );
  const budgetPending = pendingFinanceItems.length;
  const qaReleasePending = pendingQaItems.length;

  const slaBreaches = useMemo(() => {
    const now = Date.now();
    const financeBreachHours = 48;
    const qaBreachHours = 24;

    const financeBreaches = pendingFinanceItems.filter((item) => {
      const at = toDate(item.SubmittedAt);
      if (!at) return false;
      return (now - at.getTime()) / 3_600_000 >= financeBreachHours;
    }).length;

    const qaBreaches = pendingQaItems.filter((item) => {
      const at = toDate(item.InspectionDate);
      if (!at) return false;
      return (now - at.getTime()) / 3_600_000 >= qaBreachHours;
    }).length;

    return financeBreaches + qaBreaches;
  }, [pendingFinanceItems, pendingQaItems]);

  const throughputTrendData = useMemo<ThroughputPoint[]>(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { key: dayKey(date), label: shortDay(date) };
    });
    const pendingMap = new Map(days.map((d) => [d.key, 0]));
    const resolvedMap = new Map(days.map((d) => [d.key, 0]));

    financeQueue.forEach((item) => {
      const at = toDate(item.SubmittedAt);
      if (!at) return;
      const key = dayKey(at);
      if (!pendingMap.has(key)) return;
      if (isPendingStatus(item.Status)) {
        pendingMap.set(key, (pendingMap.get(key) ?? 0) + 1);
      } else {
        resolvedMap.set(key, (resolvedMap.get(key) ?? 0) + 1);
      }
    });

    qaQueue.forEach((item) => {
      const at = toDate(item.InspectionDate);
      if (!at) return;
      const key = dayKey(at);
      if (!pendingMap.has(key)) return;
      if (isPendingStatus(item.Status)) {
        pendingMap.set(key, (pendingMap.get(key) ?? 0) + 1);
      } else {
        resolvedMap.set(key, (resolvedMap.get(key) ?? 0) + 1);
      }
    });

    return days.map((d) => ({
      day: d.label,
      pending: pendingMap.get(d.key) ?? 0,
      resolved: resolvedMap.get(d.key) ?? 0,
    }));
  }, [financeQueue, qaQueue]);

  const moduleBacklogData = useMemo<ModuleBacklogPoint[]>(
    () => [
      { module: "BOM", count: bomPending },
      { module: "Budget", count: budgetPending },
      { module: "QA", count: qaReleasePending },
      { module: "SLA", count: slaBreaches },
    ],
    [bomPending, budgetPending, qaReleasePending, slaBreaches],
  );

  const inventorySummary = useMemo(() => {
    const lowStock = inventoryRows.filter((row) => (row.QuantityOnHand ?? 0) <= 5).length;
    const inProduction = inventoryRows.filter((row) =>
      (row.Status || "").toLowerCase().includes("production")).length;
    const totalQty = inventoryRows.reduce((sum, row) => sum + (row.QuantityOnHand ?? 0), 0);
    return { lowStock, inProduction, totalQty };
  }, [inventoryRows]);

  const reportItems = useMemo(
    () => [
      {
        name: "Approval SLA Performance",
        subtitle: `${slaBreaches} active breach(es) across approval queue`,
        state: slaBreaches > 0 ? "Needs Review" : "Healthy",
      },
      {
        name: "Rejection & Revision Summary",
        subtitle: `${qaQueue.filter((item) => !["pass", "passed"].includes((item.Result || "").trim().toLowerCase())).length} non-pass QA results`,
        state: "Ready",
      },
      {
        name: "Inventory Exposure Report",
        subtitle: `${inventorySummary.lowStock} low-stock rows • ${inventorySummary.totalQty.toLocaleString()} total units`,
        state: inventorySummary.lowStock > 0 ? "At Risk" : "Ready",
      },
      {
        name: "Audit Trail Snapshot",
        subtitle: `${auditItems.length} latest actions captured`,
        state: "Ready",
      },
    ],
    [auditItems.length, inventorySummary.lowStock, inventorySummary.totalQty, qaQueue],
  );

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setAnalysisError(null);
    try {
      const focus = [
        "Generate an executive analysis for admin reports.",
        `BOM Pending: ${bomPending}.`,
        `Budget Pending: ${budgetPending}.`,
        `QA Release Pending: ${qaReleasePending}.`,
        `SLA Breaches: ${slaBreaches}.`,
        `Inventory Summary Total Units: ${inventorySummary.totalQty}.`,
        `Low Stock Rows: ${inventorySummary.lowStock}.`,
        `In Production Rows: ${inventorySummary.inProduction}.`,
        `Audit Events Count: ${auditItems.length}.`,
        "Cover insights from KPI cards, throughput trend, module backlog, and approval governance reports.",
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Approval throughput, SLA health, inventory exposure, and governance reporting.
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
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="BOM Pending"
          value={isLoading ? "..." : bomPending.toLocaleString()}
          icon={Boxes}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Awaiting approval"
        />
        <DashboardStatsCard
          title="Budget Pending"
          value={isLoading ? "..." : budgetPending.toLocaleString()}
          icon={Wallet}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Finance gate queue"
        />
        <DashboardStatsCard
          title="QA Release Pending"
          value={isLoading ? "..." : qaReleasePending.toLocaleString()}
          icon={ClipboardCheck}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Needs disposition"
        />
        <DashboardStatsCard
          title="SLA Breaches"
          value={isLoading ? "..." : slaBreaches.toLocaleString()}
          icon={AlertTriangle}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Aging approvals"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ReportCard title="Approval Throughput Trend" icon={FileText} exportLabel="Export Chart">
          <p className="mb-3 text-xs text-slate-500">7-day view of pending versus resolved approvals.</p>
          <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputTrendData}>
                <defs>
                  <linearGradient id="reportsPendingStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="reportsPendingArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="reportsResolvedStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="pending" fill="url(#reportsPendingArea)" stroke="none" />
                <Line type="monotone" dataKey="pending" name="Pending Approvals" stroke="url(#reportsPendingStroke)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved Approvals" stroke="url(#reportsResolvedStroke)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>

        <ReportCard title="Backlog by Module" icon={ShieldCheck} exportLabel="Export Chart">
          <p className="mb-3 text-xs text-slate-500">Current open queue distribution by module.</p>
          <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleBacklogData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="module" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="count" name="Open Backlog" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ReportCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Approval Governance Reports</CardTitle>
            <CardDescription>Operational and compliance report packs with live status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.subtitle}</p>
                </div>
                <StatusBadge status={item.state} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inventory Summary</CardTitle>
            <CardDescription>Operational stock summary table for admin reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Metric</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">Inventory Summary</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{inventorySummary.totalQty.toLocaleString()} total units</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">Low Stock Rows</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{inventorySummary.lowStock}</td>
                  </tr>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">In Production Rows</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{inventorySummary.inProduction}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Generated Analysis</CardTitle>
          <CardDescription>
            AI-generated narrative summary across BOM Pending to Approval Governance Reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analysisError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {analysisError}
            </div>
          ) : generatedAnalysis ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
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
