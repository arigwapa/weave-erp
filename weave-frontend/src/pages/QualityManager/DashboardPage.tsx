import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, Bug, RefreshCcw } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { inspectionApi, type InspectionHistoryItem, type QaBatchItem } from "../../lib/api/inspectionApi";
import { defectLogApi, type DefectLog } from "../../lib/api/defectLogApi";

export default function DashboardPage() {
  const [pendingItems, setPendingItems] = useState<QaBatchItem[]>([]);
  const [inspectionHistory, setInspectionHistory] = useState<InspectionHistoryItem[]>([]);
  const [defectLogs, setDefectLogs] = useState<DefectLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [pendingData, historyData, defectData] = await Promise.all([
          inspectionApi.getPending(),
          inspectionApi.listHistory(),
          defectLogApi.list(),
        ]);
        setPendingItems(pendingData ?? []);
        setInspectionHistory(historyData ?? []);
        setDefectLogs(defectData ?? []);
      } catch (error) {
        setPendingItems([]);
        setInspectionHistory([]);
        setDefectLogs([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load QA dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  const pendingCount = pendingItems.length;

  const completedInspections = useMemo(
    () => inspectionHistory.filter((item) => (item.Status || "").trim().toLowerCase() === "completed"),
    [inspectionHistory],
  );

  const passFailRates = useMemo(() => {
    const total = completedInspections.length;
    if (total === 0) return { passRate: 0, failRate: 0 };

    const passCount = completedInspections.filter((item) => {
      const result = (item.Result || "").trim().toLowerCase();
      return result === "accepted" || result === "pass" || result === "passed";
    }).length;

    const failCount = completedInspections.filter((item) => {
      const result = (item.Result || "").trim().toLowerCase();
      return result.includes("reject") || result.includes("review") || result.includes("fail");
    }).length;

    return {
      passRate: (passCount / total) * 100,
      failRate: (failCount / total) * 100,
    };
  }, [completedInspections]);

  const reworkLoops = useMemo(
    () =>
      completedInspections.filter((item) => {
        const decision = (item.QaDecision || "").toLowerCase();
        const result = (item.Result || "").toLowerCase();
        return decision.includes("rework") || decision.includes("revise") || result.includes("review") || result.includes("reject");
      }).length,
    [completedInspections],
  );

  const defectDistribution = useMemo(() => {
    const severityRank: Record<string, number> = { critical: 4, high: 3, major: 3, medium: 2, minor: 2, low: 1 };
    const severityLabel = (severity: string): string => {
      const value = severity.trim().toLowerCase();
      if (value === "critical") return "Critical";
      if (value === "high" || value === "major") return "High";
      if (value === "medium" || value === "minor") return "Medium";
      return "Low";
    };

    const grouped = defectLogs.reduce<Map<string, { severity: string; type: string; count: number }>>((acc, row) => {
      const type = String(row.DefectType || "Unspecified defect").trim() || "Unspecified defect";
      const severity = severityLabel(String(row.Severity || "Low"));
      const key = `${severity}::${type}`;
      const current = acc.get(key);
      if (current) {
        current.count += 1;
      } else {
        acc.set(key, { severity, type, count: 1 });
      }
      return acc;
    }, new Map());

    return Array.from(grouped.values())
      .sort((a, b) => {
        const bySeverity = (severityRank[b.severity.toLowerCase()] ?? 0) - (severityRank[a.severity.toLowerCase()] ?? 0);
        return bySeverity !== 0 ? bySeverity : b.count - a.count;
      })
      .slice(0, 4);
  }, [defectLogs]);

  const passFailByCollection = useMemo(() => {
    const items = completedInspections
      .slice()
      .sort((a, b) => {
        const d1 = new Date(a.InspectionDate || a.CreatedAt).getTime();
        const d2 = new Date(b.InspectionDate || b.CreatedAt).getTime();
        return d2 - d1;
      })
      .slice(0, 4)
      .map((item) => {
        const status = (item.Result || "").toLowerCase().includes("accept") ? "Pass" : "Fail";
        return {
          label: `${item.BatchCode || "N/A"} / ${item.VersionNumber || "V1"}`,
          status,
        };
      });
    return items;
  }, [completedInspections]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">QA Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Phase 5 quality gate overview for inspection workload, quality outcomes, and defect risk.
            </p>
          </div>
          <StatusBadge status={loadError ? "On Hold" : "Operational"} />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          QA decisions must include complete defect logs and pass/fail disposition before release.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Pending Inspection"
          value={isLoading ? "..." : pendingCount.toLocaleString()}
          icon={Boxes}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Batches waiting"
        />
        <DashboardStatsCard
          title="Pass Rate"
          value={isLoading ? "..." : `${passFailRates.passRate.toFixed(1)}%`}
          icon={RefreshCcw}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="By collection/version"
        />
        <DashboardStatsCard
          title="Fail Rate"
          value={isLoading ? "..." : `${passFailRates.failRate.toFixed(1)}%`}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Current cycle"
        />
        <DashboardStatsCard
          title="Rework Loops"
          value={isLoading ? "..." : reworkLoops.toLocaleString()}
          icon={Bug}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Per product"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Defect Distribution</CardTitle>
            <CardDescription>Defect split by severity and type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defectDistribution.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                No defect entries available from current QA logs.
              </div>
            ) : (
              defectDistribution.map((item) => (
                <div key={`${item.severity}-${item.type}`} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.type}</p>
                    <p className="text-xs text-slate-500">{item.severity}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Pass/Fail by Collection Version</CardTitle>
            <CardDescription>Current quality gate outcome snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {passFailByCollection.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                No completed inspections yet for pass/fail snapshot.
              </div>
            ) : (
              passFailByCollection.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to load full dashboard data: {loadError}
        </div>
      ) : null}
    </div>
  );
}
