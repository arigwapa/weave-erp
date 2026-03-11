import { useEffect, useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Clock3, Factory, GitPullRequestArrow } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { productionQueueApi, type ProductionQueueItem } from "../../lib/api/productionQueueApi";
import { productionBatchApi, type ProductionBatch } from "../../lib/api/productionBatchApi";

export default function DashboardPage() {
  const [queueRows, setQueueRows] = useState<ProductionQueueItem[]>([]);
  const [batchRows, setBatchRows] = useState<ProductionBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const toDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const dayKey = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const shortDay = (date: Date): string =>
    date.toLocaleString("en-US", { weekday: "short" });

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [queueData, batchData] = await Promise.all([
          productionQueueApi.list(),
          productionBatchApi.list(),
        ]);
        setQueueRows(queueData ?? []);
        setBatchRows(batchData ?? []);
      } catch (error) {
        setQueueRows([]);
        setBatchRows([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load production dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const waitingForProduction = useMemo(
    () => queueRows.filter((row) => String(row.QueueStatus || "").toLowerCase() === "pending").length,
    [queueRows],
  );

  const inProgressRuns = useMemo(
    () => queueRows.filter((row) => String(row.QueueStatus || "").toLowerCase() === "on going").length,
    [queueRows],
  );

  const delayedRuns = useMemo(() => {
    const now = Date.now();
    return queueRows.filter((row) => {
      const due = toDate(row.DueDate);
      if (!due) return false;
      const isCompleted = String(row.QueueStatus || "").toLowerCase() === "completed";
      return !isCompleted && due.getTime() < now;
    }).length;
  }, [queueRows]);

  const weeklyThroughput = useMemo(() => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return batchRows.reduce((sum, row) => {
      const produced = toDate(row.ProducedDate);
      if (!produced || produced.getTime() < since) return sum;
      return sum + Number(row.BatchQty ?? 0);
    }, 0);
  }, [batchRows]);

  const throughputTrendData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { key: dayKey(date), label: shortDay(date) };
    });

    const planned = new Map(days.map((d) => [d.key, 0]));
    const completed = new Map(days.map((d) => [d.key, 0]));

    queueRows.forEach((row) => {
      const due = toDate(row.DueDate);
      if (!due) return;
      const key = dayKey(due);
      if (!planned.has(key)) return;
      planned.set(key, (planned.get(key) ?? 0) + Number(row.PlannedQty ?? 0));
    });

    batchRows.forEach((row) => {
      const produced = toDate(row.ProducedDate);
      if (!produced) return;
      const key = dayKey(produced);
      if (!completed.has(key)) return;
      completed.set(key, (completed.get(key) ?? 0) + Number(row.BatchQty ?? 0));
    });

    return days.map((d) => ({
      day: d.label,
      planned: planned.get(d.key) ?? 0,
      completed: completed.get(d.key) ?? 0,
    }));
  }, [queueRows, batchRows]);

  const delayRootCauseData = useMemo(() => {
    const buckets = new Map<string, number>([
      ["Material", 0],
      ["Machine", 0],
      ["Manpower", 0],
      ["QA Hold", 0],
      ["Schedule", 0],
    ]);

    const now = Date.now();
    queueRows.forEach((row) => {
      const due = toDate(row.DueDate);
      const isDelayed = due && due.getTime() < now && String(row.QueueStatus || "").toLowerCase() !== "completed";
      if (!isDelayed) return;

      const readiness = String(row.Readiness || "").toLowerCase();
      if (readiness.includes("material")) buckets.set("Material", (buckets.get("Material") ?? 0) + 1);
      else if (readiness.includes("machine")) buckets.set("Machine", (buckets.get("Machine") ?? 0) + 1);
      else if (readiness.includes("manpower") || readiness.includes("operator")) buckets.set("Manpower", (buckets.get("Manpower") ?? 0) + 1);
      else if (readiness.includes("qa") || readiness.includes("quality")) buckets.set("QA Hold", (buckets.get("QA Hold") ?? 0) + 1);
      else buckets.set("Schedule", (buckets.get("Schedule") ?? 0) + 1);
    });

    return Array.from(buckets.entries()).map(([cause, count]) => ({ cause, count }));
  }, [queueRows]);

  const inProgressByStatus = useMemo(() => {
    const plannedCount = waitingForProduction;
    const activeCount = inProgressRuns;
    const pausedCount = queueRows.filter((row) => String(row.Readiness || "").toLowerCase().includes("hold")).length;
    return [
      { label: "Planned", count: plannedCount, badge: "Planned" },
      { label: "Active", count: activeCount, badge: "In Progress" },
      { label: "Paused", count: pausedCount, badge: "On Hold" },
    ];
  }, [queueRows, waitingForProduction, inProgressRuns]);

  const delayedCausesList = useMemo(
    () =>
      delayRootCauseData
        .filter((row) => row.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3),
    [delayRootCauseData],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Production Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Live production visibility for approved versions, run health, delay causes, and throughput.
            </p>
          </div>
          <StatusBadge status={loadError ? "On Hold" : "Operational"} />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Production runs with unresolved delay causes must include mitigation owner and revised ETA before shift close.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Waiting for Production"
          value={isLoading ? "..." : waitingForProduction.toLocaleString()}
          icon={GitPullRequestArrow}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Approved versions queued"
        />
        <DashboardStatsCard
          title="In-Progress Runs"
          value={isLoading ? "..." : inProgressRuns.toLocaleString()}
          icon={Factory}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Across active lines"
        />
        <DashboardStatsCard
          title="Delayed Runs"
          value={isLoading ? "..." : delayedRuns.toLocaleString()}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Requires intervention"
        />
        <DashboardStatsCard
          title="Weekly Throughput"
          value={isLoading ? "..." : weeklyThroughput.toLocaleString()}
          icon={Clock3}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Units completed"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Planned vs Completed Throughput</CardTitle>
            <CardDescription>Daily production output trend for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={throughputTrendData}>
                  <defs>
                    <linearGradient id="prodCompletedArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="planned" name="Planned Units" stroke="#06b6d4" strokeWidth={2.2} dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="completed" fill="url(#prodCompletedArea)" stroke="none" />
                  <Line type="monotone" dataKey="completed" name="Completed Units" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Delay Root Cause Distribution</CardTitle>
            <CardDescription>Most frequent bottlenecks impacting on-time production runs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={delayRootCauseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="cause" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Delayed Runs" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">In-Progress Runs by Status</CardTitle>
            <CardDescription>Real-time production status mix.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressByStatus.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  <StatusBadge status={item.badge} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Delayed Runs Root Causes</CardTitle>
            <CardDescription>Delay categories to prioritize corrective action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {delayedCausesList.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                No delayed runs detected from current queue data.
              </div>
            ) : delayedCausesList.map((item) => (
              <div key={item.cause} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{item.cause}</span>
                <span className="text-sm font-semibold text-slate-900">{item.count} run(s)</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operational Note</p>
        <p className="mt-1 text-sm text-slate-700">
          Prioritize the highest delay bucket first to recover weekly throughput targets faster.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to load full dashboard data: {loadError}
        </div>
      ) : null}
    </div>
  );
}
