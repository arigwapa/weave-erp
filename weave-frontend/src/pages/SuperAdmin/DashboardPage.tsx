import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ShieldAlert,
  Users,
  UserX,
  Warehouse,
  Building2,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { usersApi, type User } from "../../lib/api/usersApi";
import { adminApprovalInboxApi, type AdminApprovalFinanceItem, type AdminApprovalQaItem } from "../../lib/api/adminApprovalInboxApi";
import { branchApi, type Branch } from "../../lib/api/branchApi";
import { binLocationApi, type BinLocation } from "../../lib/api/binLocationApi";
import { productionInventoryApi, type WarehouseInventoryRow } from "../../lib/api/productionInventoryApi";

type TrendPoint = {
  month: string;
  activeUsers: number;
  pendingApprovals: number;
};

type InventoryPoint = {
  product: string;
  quantity: number;
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
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildRecentMonths(count: number): { key: string; label: string }[] {
  const now = new Date();
  const months: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    months.push({ key, label });
  }
  return months;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shortProductName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 18) return trimmed;
  return `${trimmed.slice(0, 18)}...`;
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [bins, setBins] = useState<BinLocation[]>([]);
  const [inventoryRows, setInventoryRows] = useState<WarehouseInventoryRow[]>([]);
  const [financeApprovals, setFinanceApprovals] = useState<AdminApprovalFinanceItem[]>([]);
  const [qaApprovals, setQaApprovals] = useState<AdminApprovalQaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [usersData, branchesData, binsData, inventoryData, financeData, qaData] = await Promise.all([
          usersApi.list(),
          branchApi.list(),
          binLocationApi.list(),
          productionInventoryApi.listWarehouseTable(),
          adminApprovalInboxApi.listFinance(),
          adminApprovalInboxApi.listQa(),
        ]);
        setUsers(usersData);
        setBranches(branchesData);
        setBins(binsData);
        setInventoryRows(inventoryData);
        setFinanceApprovals(financeData);
        setQaApprovals(qaData);
      } catch (error) {
        setUsers([]);
        setBranches([]);
        setBins([]);
        setInventoryRows([]);
        setFinanceApprovals([]);
        setQaApprovals([]);
        setLoadError(error instanceof Error ? error.message : "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.IsActive).length;
  const lockedAccounts = users.filter((user) => {
    const status = (user.Status || "").toLowerCase();
    return status.includes("lock") || (!status && user.IsActive === false);
  }).length;

  const pendingFinance = financeApprovals.filter((item) => isPendingStatus(item.Status)).length;
  const pendingQa = qaApprovals.filter((item) => isPendingStatus(item.Status)).length;
  const pendingApprovals = pendingFinance + pendingQa;

  const warehouseCount = useMemo(() => {
    const keys = new Set<string>();
    users.forEach((user) => {
      if (user.WarehouseID && user.WarehouseID > 0) {
        keys.add(`id-${user.WarehouseID}`);
      } else if (user.WarehouseName?.trim()) {
        keys.add(`name-${user.WarehouseName.trim().toLowerCase()}`);
      }
    });
    return keys.size;
  }, [users]);

  const stockHealthIndex = useMemo(() => {
    const activeBins = bins.filter((bin) => bin.IsBinActive);
    if (activeBins.length === 0) return 0;
    const occupied = activeBins.filter((bin) => {
      const status = (bin.OccupancyStatus || "").trim().toLowerCase();
      return (
        status.includes("occupied")
        || (bin.OccupiedQuantity ?? 0) > 0
        || (bin.OccupiedVersionID ?? 0) > 0
      );
    }).length;
    return Math.round(((activeBins.length - occupied) / activeBins.length) * 100);
  }, [bins]);

  const enterpriseTrendData = useMemo<TrendPoint[]>(() => {
    const months = buildRecentMonths(6);
    const pendingByMonth = new Map<string, number>(months.map((month) => [month.key, 0]));
    const activeByMonth = new Map<string, number>(months.map((month) => [month.key, 0]));

    financeApprovals.forEach((item) => {
      if (!isPendingStatus(item.Status)) return;
      const date = toDate(item.SubmittedAt);
      if (!date) return;
      const key = monthKey(date);
      if (pendingByMonth.has(key)) {
        pendingByMonth.set(key, (pendingByMonth.get(key) ?? 0) + 1);
      }
    });

    qaApprovals.forEach((item) => {
      if (!isPendingStatus(item.Status)) return;
      const date = toDate(item.InspectionDate);
      if (!date) return;
      const key = monthKey(date);
      if (pendingByMonth.has(key)) {
        pendingByMonth.set(key, (pendingByMonth.get(key) ?? 0) + 1);
      }
    });

    users.forEach((user) => {
      if (!user.IsActive) return;
      const createdAt = toDate(user.CreatedAt);
      if (!createdAt) return;
      const key = monthKey(createdAt);
      if (activeByMonth.has(key)) {
        activeByMonth.set(key, (activeByMonth.get(key) ?? 0) + 1);
      }
    });

    const hasCreatedDates = Array.from(activeByMonth.values()).some((count) => count > 0);
    return months.map((month) => ({
      month: month.label,
      activeUsers: hasCreatedDates ? (activeByMonth.get(month.key) ?? 0) : activeUsers,
      pendingApprovals: pendingByMonth.get(month.key) ?? 0,
    }));
  }, [activeUsers, financeApprovals, qaApprovals, users]);

  const inventoryChartData = useMemo<InventoryPoint[]>(() => {
    const byProduct = new Map<string, number>();
    inventoryRows.forEach((row) => {
      const label =
        (row.ReleaseTag || "").trim()
        || (row.CollectionName || "").trim()
        || (row.ProductID ? `Product ${row.ProductID}` : `Version ${row.VersionID}`);
      byProduct.set(label, (byProduct.get(label) ?? 0) + (row.QuantityOnHand ?? 0));
    });

    return Array.from(byProduct.entries())
      .map(([product, quantity]) => ({ product: shortProductName(product), quantity }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [inventoryRows]);

  const integrationHealth = [
    { name: "Finance Approval Queue", status: pendingFinance > 0 ? "Warning" : "Healthy", uptime: `${pendingFinance} pending` },
    { name: "QA Approval Queue", status: pendingQa > 0 ? "Warning" : "Healthy", uptime: `${pendingQa} pending` },
    { name: "Warehouse Inventory", status: inventoryRows.length > 0 ? "Healthy" : "No Data", uptime: `${inventoryRows.length} rows` },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Global Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enterprise-wide visibility for user access, branches, approvals, quality, and platform health.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Total Users"
          value={isLoading ? "..." : totalUsers.toLocaleString()}
          icon={Users}
          colorTheme="indigo"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Across all roles and branches"
        />
        <DashboardStatsCard
          title="Active Users"
          value={isLoading ? "..." : activeUsers.toLocaleString()}
          icon={CheckCircle2}
          colorTheme="emerald"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="Last 24 hours"
        />
        <DashboardStatsCard
          title="Locked Accounts"
          value={isLoading ? "..." : lockedAccounts.toLocaleString()}
          icon={UserX}
          colorTheme="blue"
          trend={loadError ? "Error" : "Live"}
          trendUp={false}
          subText="Needs security review"
        />
        <DashboardStatsCard
          title="Pending Approvals"
          value={isLoading ? "..." : pendingApprovals.toLocaleString()}
          icon={ShieldAlert}
          colorTheme="cyan"
          trend={loadError ? "Error" : "Live"}
          trendUp
          subText="All modules combined"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Branch & Warehouse Coverage</CardTitle>
            <CardDescription>
              Branch count, warehouse count, and branch stock health index snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 size={16} />
                <span className="text-xs font-medium">Branches</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {isLoading ? "..." : branches.length.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Warehouse size={16} />
                <span className="text-xs font-medium">Warehouses</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {isLoading ? "..." : warehouseCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Activity size={16} />
                <span className="text-xs font-medium">Stock Health Index</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {isLoading ? "..." : `${stockHealthIndex}%`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">System Uptime & API Health</CardTitle>
            <CardDescription>Integration status across critical services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {integrationHealth.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                No integration health data available.
              </div>
            ) : (
              integrationHealth.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">Uptime: {item.uptime}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Enterprise Activity Trend</CardTitle>
            <CardDescription>Monthly active users versus pending approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            {enterpriseTrendData.length === 0 ? (
              <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 flex items-center justify-center">
                No enterprise trend data available.
              </div>
            ) : (
              <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={enterpriseTrendData}>
                    <defs>
                      <linearGradient id="activeUsersStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="activeUsersArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="pendingApprovalsStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#475569" }} />
                    <Area
                      type="monotone"
                      dataKey="activeUsers"
                      fill="url(#activeUsersArea)"
                      stroke="none"
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      name="Active Users"
                      stroke="url(#activeUsersStroke)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#4f46e5", stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: "#4338ca", stroke: "#fff", strokeWidth: 1.5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pendingApprovals"
                      name="Pending Approvals"
                      stroke="url(#pendingApprovalsStroke)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: "#0284c7", stroke: "#fff", strokeWidth: 1.5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Inventory Stock</CardTitle>
            <CardDescription>Current stock quantity by product found in inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryChartData.length === 0 ? (
              <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 flex items-center justify-center">
                No inventory stock data available.
              </div>
            ) : (
              <div className="h-64 w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="product" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} angle={-20} height={54} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip />
                    <Bar dataKey="quantity" name="Quantity On Hand" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
