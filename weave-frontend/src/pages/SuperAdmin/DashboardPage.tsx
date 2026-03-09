import {
  Activity,
  CheckCircle2,
  ShieldAlert,
  Users,
  UserX,
  Warehouse,
  Building2,
} from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

type QaTrendItem = {
  branch: string;
  failRate: number;
  avgCycle: string;
};

type IntegrationHealthItem = {
  name: string;
  status: string;
  uptime: string;
};

const qaTrend: QaTrendItem[] = [];
const integrationHealth: IntegrationHealthItem[] = [];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Global Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enterprise-wide visibility for user access, branches, approvals, quality, and platform health.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Total Users"
          value="0"
          icon={Users}
          colorTheme="indigo"
          trend="+4.8%"
          trendUp
          subText="Across all roles and branches"
        />
        <DashboardStatsCard
          title="Active Users"
          value="0"
          icon={CheckCircle2}
          colorTheme="emerald"
          trend="+2.1%"
          trendUp
          subText="Last 24 hours"
        />
        <DashboardStatsCard
          title="Locked Accounts"
          value="0"
          icon={UserX}
          colorTheme="blue"
          trend="-6.3%"
          trendUp={false}
          subText="Needs security review"
        />
        <DashboardStatsCard
          title="Pending Approvals"
          value="0"
          icon={ShieldAlert}
          colorTheme="cyan"
          trend="+9.4%"
          trendUp
          subText="All modules combined"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Branch & Warehouse Coverage</CardTitle>
            <CardDescription>
              Branch count, warehouse count, and branch stock health index snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 size={16} />
                <span className="text-xs font-medium">Branches</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Warehouse size={16} />
                <span className="text-xs font-medium">Warehouses</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Activity size={16} />
                <span className="text-xs font-medium">Stock Health Index</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">0%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
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
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
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
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Enterprise Activity Trend</CardTitle>
            <CardDescription>Monthly active users versus pending approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 flex items-center justify-center">
              No enterprise trend data available.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Branch Stock Health Comparison</CardTitle>
            <CardDescription>Current stock health index by major branch.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 flex items-center justify-center">
              No branch performance data available.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">QA Fail Trend by Branch</CardTitle>
            <CardDescription>Current fail trend and average cycle time by branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {qaTrend.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
                No QA trend data available.
              </div>
            ) : qaTrend.map((entry) => (
              <div key={entry.branch} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{entry.branch}</span>
                  <span className="text-slate-500">
                    Fail {entry.failRate}% • Cycle {entry.avgCycle}
                  </span>
                </div>
                <div className="h-2.5 rounded-full border border-sky-200 bg-sky-50">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, rgba(186,230,253,1) 0%, rgba(125,211,252,1) 45%, rgba(167,139,250,1) 100%)",
                      boxShadow: "0 0 0 1px rgba(125,211,252,0.35) inset",
                      width: `${Math.min(entry.failRate * 15, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Pending Approvals by Module</CardTitle>
            <CardDescription>Cross-module queue with review priority highlights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              No pending approval data available.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
