import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Eye, FileText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { inspectionApi, type InspectionHistoryItem, type QaBatchItem } from "../../lib/api/inspectionApi";
import { generateExecutiveReport } from "../../lib/analyticsApi";

type ReportItem = {
  name: string;
  subtitle: string;
  status: string;
};

const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const shortDay = (date: Date): string => date.toLocaleString("en-US", { weekday: "short" });

export default function QAAnalyticsPage() {
  const [pendingItems, setPendingItems] = useState<QaBatchItem[]>([]);
  const [historyItems, setHistoryItems] = useState<InspectionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generatedAnalysis, setGeneratedAnalysis] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false);
  const [toastState, setToastState] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [pendingData, historyData] = await Promise.all([
          inspectionApi.getPending(),
          inspectionApi.listHistory(),
        ]);
        setPendingItems(pendingData ?? []);
        setHistoryItems(historyData ?? []);
      } catch (error) {
        setPendingItems([]);
        setHistoryItems([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load QA reports data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  const completed = useMemo(
    () => historyItems.filter((x) => (x.Status || "").trim().toLowerCase() === "completed"),
    [historyItems],
  );

  const rates = useMemo(() => {
    const total = completed.length;
    if (total === 0) return { passRate: 0, failRate: 0 };
    const pass = completed.filter((x) => (x.Result || "").toLowerCase().includes("accept")).length;
    const fail = completed.filter((x) => {
      const result = (x.Result || "").toLowerCase();
      return result.includes("reject") || result.includes("review") || result.includes("fail");
    }).length;
    return {
      passRate: (pass / total) * 100,
      failRate: (fail / total) * 100,
    };
  }, [completed]);

  const reworkLoops = useMemo(
    () =>
      completed.filter((x) => {
        const decision = (x.QaDecision || "").toLowerCase();
        return decision.includes("rework") || decision.includes("revise");
      }).length,
    [completed],
  );

  const failTrend = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - idx));
      return { key: dayKey(d), label: shortDay(d) };
    });
    const passMap = new Map(days.map((d) => [d.key, 0]));
    const failMap = new Map(days.map((d) => [d.key, 0]));
    completed.forEach((item) => {
      const at = toDate(item.InspectionDate || item.CreatedAt);
      if (!at) return;
      const key = dayKey(at);
      if (!passMap.has(key)) return;
      if ((item.Result || "").toLowerCase().includes("accept")) passMap.set(key, (passMap.get(key) ?? 0) + 1);
      else failMap.set(key, (failMap.get(key) ?? 0) + 1);
    });
    return {
      labels: days.map((d) => d.label),
      passSeries: days.map((d) => passMap.get(d.key) ?? 0),
      failSeries: days.map((d) => failMap.get(d.key) ?? 0),
    };
  }, [completed]);

  const defectTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    completed.forEach((item) => {
      const raw = String(item.DefectEntries || "").trim();
      if (!raw) return;
      const parts = raw
        .split(/[,\n;|]/g)
        .map((x) => x.trim())
        .filter(Boolean);
      parts.forEach((part) => {
        const normalized = part
          .replace(/^\d+\s*[:.)-]?\s*/, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (!normalized) return;
        map.set(normalized, (map.get(normalized) ?? 0) + 1);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [completed]);

  const totalDefectEntries = useMemo(
    () =>
      completed.reduce((sum, item) => {
        const raw = String(item.DefectEntries || "").trim();
        if (!raw) return sum;
        const parts = raw
          .split(/[,\n;|]/g)
          .map((x) => x.trim())
          .filter(Boolean);
        return sum + parts.length;
      }, 0),
    [completed],
  );

  const failRateChartUrl = useMemo(
    () =>
      `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
        JSON.stringify({
          type: "line",
          data: {
            labels: failTrend.labels,
            datasets: [
              {
                label: "Accepted",
                data: failTrend.passSeries,
                borderColor: "#22c55e",
                backgroundColor: "rgba(34,197,94,0.16)",
                fill: false,
                tension: 0.35,
                pointRadius: 2.5,
                borderWidth: 2.4,
              },
              {
                label: "Rejected/Review",
                data: failTrend.failSeries,
                borderColor: "#ef4444",
                backgroundColor: "rgba(239,68,68,0.14)",
                fill: true,
                tension: 0.35,
                pointRadius: 2.5,
                borderWidth: 2.2,
              },
            ],
          },
          options: {
            plugins: {
              legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8, color: "#334155", padding: 16 } },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.22)" }, ticks: { color: "#64748b" } },
              x: { grid: { display: false }, ticks: { color: "#64748b" } },
            },
          },
        }),
      )}`,
    [failTrend],
  );

  const defectChartUrl = useMemo(
    () =>
      `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
        JSON.stringify({
          type: "bar",
          data: {
            labels: defectTypeCounts.map(([label]) => label),
            datasets: [
              {
                label: "Defect Count",
                data: defectTypeCounts.map(([, count]) => count),
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
      )}`,
    [defectTypeCounts],
  );

  const reportItems = useMemo<ReportItem[]>(
    () => [
      {
        name: "Fail Rate Trends",
        subtitle: `${rates.failRate.toFixed(1)}% fail/review against ${completed.length} completed inspections`,
        status: rates.failRate > 10 ? "At Risk" : "Healthy",
      },
      {
        name: "Defect Pattern Summary",
        subtitle: `${totalDefectEntries} defect entries detected across completed QA records`,
        status: totalDefectEntries > 0 ? "Ready" : "Pending",
      },
      {
        name: "Rework Loop Exposure",
        subtitle: `${reworkLoops} loop(s) detected in QA decisions`,
        status: reworkLoops > 0 ? "Needs Review" : "Healthy",
      },
    ],
    [rates.failRate, completed.length, totalDefectEntries, reworkLoops],
  );

  const runGenerateReport = async () => {
    setIsGenerating(true);
    setAnalysisError(null);
    try {
      const focus = [
        "Generate executive QA reports summary.",
        `Pending Inspections: ${pendingItems.length}.`,
        `Pass Rate: ${rates.passRate.toFixed(1)}%.`,
        `Fail Rate: ${rates.failRate.toFixed(1)}%.`,
        `Rework Loops: ${reworkLoops}.`,
        `Defect Entries: ${totalDefectEntries}.`,
        "Cover fail trends, defect distribution, and early warning insights.",
      ].join(" ");

      const result = await generateExecutiveReport(undefined, undefined, focus);
      setGeneratedAnalysis(result.reportText || "No analysis generated.");
      setToastState({ type: "success", message: "QA report analysis generated." });
    } catch (error) {
      setGeneratedAnalysis("");
      setAnalysisError(error instanceof Error ? error.message : "Failed to generate QA report analysis.");
      setToastState({ type: "error", message: "Unable to generate QA report analysis." });
    } finally {
      setIsGenerating(false);
      setConfirmGenerateOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">QA Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Trend analysis for fail rates, defect patterns, and repeated quality warning signals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              isLoading={isGenerating}
              onClick={() => setConfirmGenerateOpen(true)}
            >
              Generate Report
            </PrimaryButton>
            <StatusBadge status={loadError ? "On Hold" : "Operational"} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          QA reporting must be based on completed inspection history, defect logs, and verified pass/fail outcomes.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Pending Inspection"
          value={isLoading ? "..." : pendingItems.length.toLocaleString()}
          icon={ClipboardCheck}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Batches waiting"
        />
        <DashboardStatsCard
          title="Pass Rate"
          value={isLoading ? "..." : `${rates.passRate.toFixed(1)}%`}
          icon={ShieldCheck}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Completed inspections"
        />
        <DashboardStatsCard
          title="Fail Rate"
          value={isLoading ? "..." : `${rates.failRate.toFixed(1)}%`}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Rejected/review outcomes"
        />
        <DashboardStatsCard
          title="Rework Loops"
          value={isLoading ? "..." : reworkLoops.toLocaleString()}
          icon={FileText}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="QA decision loops"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Fail Rate Trends</CardTitle>
            <CardDescription>Accepted vs rejected/review outcomes over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={failRateChartUrl}
              alt="Fail rate trend chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Defect Distribution</CardTitle>
            <CardDescription>Top defect categories based on logged inspection defects.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={defectChartUrl}
              alt="Defect distribution chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">QA Report Catalog</CardTitle>
          <CardDescription>Operational report packs with live status and quick details view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={item.status} />
                <SecondaryButton
                  className="!h-8 !w-auto !rounded-full !px-3 !py-1 text-[11px]"
                  onClick={() => setSelectedReport(item)}
                >
                  <Eye size={12} className="mr-1" />
                  Details
                </SecondaryButton>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Generated Analysis</CardTitle>
          <CardDescription>
            AI-generated QA summary for fail trend, defect distribution, and rework loop exposure.
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
              Click <span className="font-semibold text-slate-700">Generate Report</span> to create AI QA analysis.
            </div>
          )}
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Report Details"
        itemId={selectedReport?.name || ""}
        headerIcon={<FileText size={18} className="text-indigo-600" />}
        gridFields={[
          { label: "Report", value: selectedReport?.name || "-", icon: FileText },
          { label: "Status", value: selectedReport ? <StatusBadge status={selectedReport.status} /> : "-", icon: ShieldCheck },
          { label: "Summary", value: selectedReport?.subtitle || "-", icon: ClipboardCheck },
        ]}
      />

      <ConfirmationModal
        isOpen={confirmGenerateOpen}
        onClose={() => setConfirmGenerateOpen(false)}
        onConfirm={() => void runGenerateReport()}
        title="Generate QA Report?"
        message="This will run Gemini analysis using current QA metrics, defect trends, and warning signals."
        confirmText="Generate"
        cancelText="Cancel"
      />

      {toastState ? (
        <Toast type={toastState.type} message={toastState.message} onClose={() => setToastState(null)} />
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to load full QA report data: {loadError}
        </div>
      ) : null}
    </div>
  );
}
