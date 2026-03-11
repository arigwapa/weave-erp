import { useEffect, useMemo, useState } from "react";
import { Area, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Boxes, Clock3, FolderKanban, RefreshCcw, Wallet } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { collectionsApi, type Collection } from "../../lib/api/collectionsApi";
import { productsApi, type Product } from "../../lib/api/productsApi";
import { bomApi, type BomLine } from "../../lib/api/bomApi";
import { plmRevisionsApi, type PlmRevisionQueueItem } from "../../lib/api/plmRevisionsApi";
import { financeBudgetPlannerApi, type FinanceBudgetPlannerCollection } from "../../lib/api/financeBudgetPlannerApi";

export default function DashboardPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bomLines, setBomLines] = useState<BomLine[]>([]);
  const [revisions, setRevisions] = useState<PlmRevisionQueueItem[]>([]);
  const [budgetRows, setBudgetRows] = useState<FinanceBudgetPlannerCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const toDate = (value?: string): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const toDayKey = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const toShortDay = (date: Date): string =>
    date.toLocaleString("en-US", { weekday: "short" });

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [collectionData, productData, bomData, revisionData, plannerData] = await Promise.all([
          collectionsApi.list(),
          productsApi.list(),
          bomApi.list(),
          plmRevisionsApi.list(),
          financeBudgetPlannerApi.listCollections(),
        ]);
        setCollections(collectionData ?? []);
        setProducts(productData ?? []);
        setBomLines(bomData ?? []);
        setRevisions(revisionData ?? []);
        setBudgetRows(plannerData ?? []);
      } catch (error) {
        setCollections([]);
        setProducts([]);
        setBomLines([]);
        setRevisions([]);
        setBudgetRows([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const draftCollections = useMemo(
    () =>
      collections.filter((item) => {
        const status = String(item.Status ?? "").toLowerCase();
        return status !== "archived" && !status.includes("submitted to admin") && !status.includes("released");
      }).length,
    [collections],
  );

  const pendingFinanceReview = useMemo(
    () =>
      budgetRows.filter((item) => {
        const status = String(item.PlannerStatus ?? "").toLowerCase();
        return status.includes("planning budget") || status.includes("review");
      }).length,
    [budgetRows],
  );

  const rejectedItems = useMemo(
    () => revisions.filter((item) => item.IsRevision || String(item.AdminDecision).toLowerCase().includes("reject")).length,
    [revisions],
  );

  const mostRevisedProducts = useMemo(
    () =>
      products.filter((item) => {
        const combined = `${item.Status || ""} ${item.ApprovalStatus || ""}`.toLowerCase();
        return combined.includes("revision") || combined.includes("returned") || combined.includes("rejected");
      }).length,
    [products],
  );

  const revisionTrendData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { key: toDayKey(date), label: toShortDay(date) };
    });

    const submittedMap = new Map(days.map((d) => [d.key, 0]));
    const returnedMap = new Map(days.map((d) => [d.key, 0]));

    collections.forEach((item) => {
      const status = String(item.Status || "").toLowerCase();
      if (!status.includes("submitted")) return;
      const stamp = toDate(item.UpdatedAt || item.CreatedAt || item.TargetLaunchDate);
      if (!stamp) return;
      const key = toDayKey(stamp);
      if (!submittedMap.has(key)) return;
      submittedMap.set(key, (submittedMap.get(key) ?? 0) + 1);
    });

    revisions.forEach((item) => {
      const stamp = toDate(item.UpdatedAt);
      if (!stamp) return;
      const key = toDayKey(stamp);
      if (!returnedMap.has(key)) return;
      returnedMap.set(key, (returnedMap.get(key) ?? 0) + 1);
    });

    return days.map((d) => ({
      day: d.label,
      submitted: submittedMap.get(d.key) ?? 0,
      returned: returnedMap.get(d.key) ?? 0,
    }));
  }, [collections, revisions]);

  const bomCostDistribution = useMemo(() => {
    const totals = new Map<string, number>();
    bomLines.forEach((line) => {
      const material = (line.MaterialName || "Unknown").trim() || "Unknown";
      const amount = Number(line.QtyRequired ?? 0) * Number(line.UnitCost ?? 0);
      totals.set(material, (totals.get(material) ?? 0) + amount);
    });
    return Array.from(totals.entries())
      .map(([material, total]) => ({ material, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [bomLines]);

  const seasonLaunchWindow = useMemo(() => {
    const grouped = new Map<string, { totalDays: number; count: number }>();
    collections.forEach((item) => {
      const launch = toDate(item.TargetLaunchDate);
      if (!launch) return;
      const season = (item.Season || "Unspecified").trim() || "Unspecified";
      const daysUntilLaunch = Math.max(0, Math.round((launch.getTime() - Date.now()) / 86_400_000));
      const existing = grouped.get(season) ?? { totalDays: 0, count: 0 };
      grouped.set(season, { totalDays: existing.totalDays + daysUntilLaunch, count: existing.count + 1 });
    });

    return Array.from(grouped.entries())
      .map(([season, data]) => ({
        season,
        avgDays: Math.round(data.totalDays / Math.max(1, data.count)),
      }))
      .sort((a, b) => a.avgDays - b.avgDays)
      .slice(0, 3);
  }, [collections]);

  const topCostDrivers = useMemo(
    () =>
      bomCostDistribution.slice(0, 3).map((item, index) => {
        const total = bomCostDistribution.reduce((sum, row) => sum + row.total, 0);
        const share = total > 0 ? Math.round((item.total / total) * 100) : 0;
        return {
          rank: index + 1,
          material: item.material,
          cost: item.total,
          share,
        };
      }),
    [bomCostDistribution],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Product Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              Real-time PLM overview for collection readiness, revision pressure, and BOM cost signals.
            </p>
          </div>
          <StatusBadge status={loadError ? "Error" : "Operational"} />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Collections with repeated rejects should include cost-impact notes before next submission.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Draft Collections"
          value={isLoading ? "..." : draftCollections.toLocaleString()}
          icon={FolderKanban}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Active season drafts"
        />
        <DashboardStatsCard
          title="Pending Finance Review"
          value={isLoading ? "..." : pendingFinanceReview.toLocaleString()}
          icon={Clock3}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Awaiting budget planning completion"
        />
        <DashboardStatsCard
          title="Rejected Items"
          value={isLoading ? "..." : rejectedItems.toLocaleString()}
          icon={RefreshCcw}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Returned for revision"
        />
        <DashboardStatsCard
          title="Most Revised Products"
          value={isLoading ? "..." : mostRevisedProducts.toLocaleString()}
          icon={Boxes}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Product records with revision flags"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revision Flow Trend</CardTitle>
            <CardDescription>7-day submitted collections versus items returned for revision.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revisionTrendData}>
                  <defs>
                    <linearGradient id="plmSubmittedArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="submitted" fill="url(#plmSubmittedArea)" stroke="none" />
                  <Line type="monotone" dataKey="submitted" name="Submitted Drafts" stroke="#4f46e5" strokeWidth={2.4} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="returned" name="Returned for Revision" stroke="#06b6d4" strokeWidth={2.4} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">BOM Cost Distribution</CardTitle>
            <CardDescription>Top materials by total BOM cost impact from live BOM records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bomCostDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="material" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip formatter={(value) => `PHP ${Number(value ?? 0).toLocaleString()}`} />
                  <Bar dataKey="total" name="Cost" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Season Launch Window</CardTitle>
            <CardDescription>Average days remaining until target launch by season.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {seasonLaunchWindow.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                No launch-date data available.
              </div>
            ) : (
              seasonLaunchWindow.map((row) => (
                <div key={row.season} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <span className="text-sm text-slate-700">{row.season}</span>
                  <span className="text-sm font-semibold text-slate-900">{row.avgDays} days</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top BOM Cost Drivers</CardTitle>
            <CardDescription>Highest material cost contributors across active BOM lines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCostDrivers.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                No BOM cost data available.
              </div>
            ) : (
              topCostDrivers.map((row) => (
                <div key={row.material} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{row.rank}. {row.material}</p>
                    <p className="text-xs text-slate-500">Cost contribution {row.share}%</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Wallet size={14} className="text-indigo-500" />
                    PHP {Math.round(row.cost).toLocaleString()}
                  </div>
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
