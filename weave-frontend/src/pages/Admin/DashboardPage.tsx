import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  PackageX,
  ShieldAlert,
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
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { adminApprovalInboxApi, type AdminApprovalFinanceItem, type AdminApprovalQaItem } from "../../lib/api/adminApprovalInboxApi";
import { productionInventoryApi, type WarehouseInventoryRow } from "../../lib/api/productionInventoryApi";

type ThroughputPoint = {
  day: string;
  pending: number;
  resolved: number;
};

type ModuleBacklogPoint = {
  module: string;
  count: number;
};

type CollectionRiskItem = {
  id: string;
  detail: string;
  status: string;
};

type OpsRiskItem = {
  name: string;
  detail: string;
  status: string;
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

function formatCurrency(value: number): string {
  return `PHP ${Math.round(value).toLocaleString()}`;
}

export default function DashboardPage() {
  const [financeQueue, setFinanceQueue] = useState<AdminApprovalFinanceItem[]>([]);
  const [qaQueue, setQaQueue] = useState<AdminApprovalQaItem[]>([]);
  const [inventoryRows, setInventoryRows] = useState<WarehouseInventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [financeData, qaData, inventoryData] = await Promise.all([
          adminApprovalInboxApi.listFinance(),
          adminApprovalInboxApi.listQa(),
          productionInventoryApi.listWarehouseTable(),
        ]);
        setFinanceQueue(financeData);
        setQaQueue(qaData);
        setInventoryRows(inventoryData);
      } catch (error) {
        setFinanceQueue([]);
        setQaQueue([]);
        setInventoryRows([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load admin dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
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

  const collectionsAtRisk = useMemo<CollectionRiskItem[]>(() => {
    const now = Date.now();
    return pendingFinanceItems
      .map((item) => {
        const submittedAt = toDate(item.SubmittedAt);
        const ageDays = submittedAt ? Math.floor((now - submittedAt.getTime()) / 86_400_000) : 0;
        const riskScore = ageDays + item.Products.length + Math.ceil(item.ContingencyPercent || 0);
        return {
          id: item.CollectionCode || item.CollectionName,
          detail: `${ageDays} day(s) pending • ${formatCurrency(item.TotalBomCost)}`,
          status: riskScore >= 7 ? "Critical" : riskScore >= 4 ? "At Risk" : "Pending",
          riskScore,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 4)
      .map(({ id, detail, status }) => ({ id, detail, status }));
  }, [pendingFinanceItems]);

  const stockRiskAndDefects = useMemo<OpsRiskItem[]>(() => {
    const byProduct = new Map<string, number>();
    inventoryRows.forEach((row) => {
      const label = (row.ReleaseTag || row.CollectionName || "").trim() || `Product ${row.ProductID ?? row.VersionID}`;
      byProduct.set(label, (byProduct.get(label) ?? 0) + (row.QuantityOnHand ?? 0));
    });

    const lowStock = Array.from(byProduct.entries())
      .map(([name, qty]) => ({
        name,
        detail: `Low stock: ${qty} units`,
        status: qty <= 5 ? "Critical" : "At Risk",
        score: qty,
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    const qaDefects = qaQueue
      .filter((item) => !["pass", "passed"].includes((item.Result || "").trim().toLowerCase()))
      .slice(0, 2)
      .map((item) => ({
        name: item.ProductName || item.BatchNumber,
        detail: `QA result: ${item.Result || "Failed"}`,
        status: "High",
      }));

    return [...lowStock.map(({ name, detail, status }) => ({ name, detail, status })), ...qaDefects];
  }, [inventoryRows, qaQueue]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Approval Gate Owner overview for approval risk, inventory pressure, and quality severity.
        </p>
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
          subText="Ready for disposition"
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
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Approval Throughput Trend</CardTitle>
            <CardDescription>7-day view of pending versus resolved approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={throughputTrendData}>
                  <defs>
                    <linearGradient id="adminPendingStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="adminPendingArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="adminResolvedStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#475569" }} />
                  <Area type="monotone" dataKey="pending" fill="url(#adminPendingArea)" stroke="none" />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending Approvals"
                    stroke="url(#adminPendingStroke)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#4f46e5", stroke: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: "#4338ca", stroke: "#fff", strokeWidth: 1.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved Approvals"
                    stroke="url(#adminResolvedStroke)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: "#0284c7", stroke: "#fff", strokeWidth: 1.5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Backlog by Module</CardTitle>
            <CardDescription>Current open approval queue distribution.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Collections at Risk</CardTitle>
            <CardDescription>Collections with prolonged pending queue or elevated cost risk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {collectionsAtRisk.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                No collection risk data available.
              </div>
            ) : (
              collectionsAtRisk.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{entry.id}</p>
                    <p className="text-xs text-slate-500">{entry.detail}</p>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Stock Risk & High Severity Defects</CardTitle>
            <CardDescription>Operational risks from low inventory and non-pass QA outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stockRiskAndDefects.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                No stock and defect risk data available.
              </div>
            ) : (
              stockRiskAndDefects.map((entry) => (
                <div
                  key={`${entry.name}-${entry.detail}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="flex items-start gap-2">
                    <PackageX size={16} className="mt-0.5 text-rose-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{entry.name}</p>
                      <p className="text-xs text-slate-500">{entry.detail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-amber-500" />
                    <StatusBadge status={entry.status} />
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
