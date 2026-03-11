import { useEffect, useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, TrendingUp, Wallet, Scale } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { financeBudgetPlannerApi, type FinanceBudgetPlannerCollection } from "../../lib/api/financeBudgetPlannerApi";

export default function VarianceAnalyticsPage() {
  const [rows, setRows] = useState<FinanceBudgetPlannerCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const varianceThreshold = 4;

  useEffect(() => {
    const loadVarianceData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await financeBudgetPlannerApi.listCollections();
        setRows(data ?? []);
      } catch (error) {
        setRows([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load variance analytics.");
      } finally {
        setIsLoading(false);
      }
    };
    void loadVarianceData();
  }, []);

  const trackedRows = useMemo(
    () => rows.filter((item) => Number(item.BudgetCap) > 0 || Number(item.Forecast) > 0),
    [rows],
  );

  const toVariancePct = (item: FinanceBudgetPlannerCollection): number => {
    const budget = Number(item.BudgetCap ?? 0);
    const estimate = Number(item.Forecast ?? 0);
    if (budget <= 0) return 0;
    return ((estimate - budget) / budget) * 100;
  };

  const withinBudgetCount = useMemo(
    () => trackedRows.filter((item) => toVariancePct(item) <= 0).length,
    [trackedRows],
  );

  const overBudgetCount = useMemo(
    () => trackedRows.filter((item) => toVariancePct(item) > 0).length,
    [trackedRows],
  );

  const averageVariance = useMemo(() => {
    if (trackedRows.length === 0) return 0;
    const total = trackedRows.reduce((sum, item) => sum + toVariancePct(item), 0);
    return total / trackedRows.length;
  }, [trackedRows]);

  const comparisonData = useMemo(
    () =>
      trackedRows
        .slice()
        .sort((a, b) => Number(b.Forecast ?? 0) - Number(a.Forecast ?? 0))
        .slice(0, 6)
        .map((item) => ({
          collection: item.CollectionCode || item.CollectionName || `COL-${item.CollectionID}`,
          budget: Number(item.BudgetCap ?? 0),
          estimated: Number(item.Forecast ?? 0),
          actual: Number(item.SpentAmount ?? 0) + Number(item.ReservedAmount ?? 0),
        })),
    [trackedRows],
  );

  const varianceTrendData = useMemo(() => {
    const grouped = new Map<string, { sum: number; count: number }>();
    trackedRows.forEach((item) => {
      const season = (item.CollectionName || item.CollectionCode || `COL-${item.CollectionID}`).trim();
      const bucket = grouped.get(season) ?? { sum: 0, count: 0 };
      bucket.sum += toVariancePct(item);
      bucket.count += 1;
      grouped.set(season, bucket);
    });
    return Array.from(grouped.entries())
      .map(([label, bucket]) => ({
        label,
        variance: Number((bucket.sum / Math.max(1, bucket.count)).toFixed(2)),
        threshold: varianceThreshold,
      }))
      .slice(0, 8);
  }, [trackedRows]);

  const breakdownRows = useMemo(
    () =>
      trackedRows
        .slice()
        .sort((a, b) => Math.abs(toVariancePct(b)) - Math.abs(toVariancePct(a)))
        .slice(0, 5)
        .map((item) => {
          const variance = toVariancePct(item);
          const status = variance > varianceThreshold ? "Over Budget" : variance > 0 ? "Review" : "Within Budget";
          return {
            key: item.CollectionID,
            name: item.CollectionName || item.CollectionCode || `COL-${item.CollectionID}`,
            budget: Number(item.BudgetCap ?? 0),
            estimated: Number(item.Forecast ?? 0),
            actual: Number(item.SpentAmount ?? 0) + Number(item.ReservedAmount ?? 0),
            status,
          };
        }),
    [trackedRows],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Variance Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare budget, estimated, and post-production actuals with trend tracking by season and collection.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Collections above variance threshold must include corrective finance notes before next approval stage.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Collections Tracked"
          value={isLoading ? "..." : trackedRows.length.toLocaleString()}
          icon={Scale}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Active in current cycle"
        />
        <DashboardStatsCard
          title="Within Budget"
          value={isLoading ? "..." : withinBudgetCount.toLocaleString()}
          icon={Wallet}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Below approved cap"
        />
        <DashboardStatsCard
          title="Over Budget"
          value={isLoading ? "..." : overBudgetCount.toLocaleString()}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Need mitigation plan"
        />
        <DashboardStatsCard
          title="Average Variance"
          value={isLoading ? "..." : `${averageVariance >= 0 ? "+" : ""}${averageVariance.toFixed(2)}%`}
          icon={TrendingUp}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Across tracked collections"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Budget vs Estimated vs Actual</CardTitle>
            <CardDescription>Collection-level cost comparison in PHP millions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="collection" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip formatter={(value) => `PHP ${Number(value ?? 0).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="estimated" name="Estimated" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Variance Trend Over Time</CardTitle>
            <CardDescription>Seasonal variance movement against threshold baseline.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={varianceTrendData}>
                  <defs>
                    <linearGradient id="varianceArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`} />
                  <Legend />
                  <Area type="monotone" dataKey="variance" name="Variance %" fill="url(#varianceArea)" stroke="none" />
                  <Line type="monotone" dataKey="variance" name="Variance %" stroke="#4f46e5" strokeWidth={2.4} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="threshold" name="Threshold %" stroke="#06b6d4" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Collection Variance Breakdown</CardTitle>
          <CardDescription>Post-production actuals shown where available.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {breakdownRows.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              No variance rows available.
            </div>
          ) : (
            breakdownRows.map((row) => (
            <div key={row.key} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{row.name}</p>
                <StatusBadge status={row.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Budget PHP {row.budget.toLocaleString()} • Estimated PHP {row.estimated.toLocaleString()} • Actual PHP {row.actual.toLocaleString()}
              </p>
            </div>
            ))
          )}
        </CardContent>
      </Card>

      {loadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Unable to load variance analytics data: {loadError}
        </div>
      ) : null}
    </div>
  );
}
