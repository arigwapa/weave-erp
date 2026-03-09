import { AlertTriangle, Boxes, Clock3, Truck } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";

export default function DashboardPage() {
  const stockVsRequestsTrendChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "line",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Low Stock SKUs",
            data: [29, 31, 34, 33, 36, 35, 34],
            borderColor: "#4f46e5",
            pointBackgroundColor: "#4338ca",
            backgroundColor: "rgba(79,70,229,0.16)",
            fill: true,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.4,
          },
          {
            label: "Pending Requests",
            data: [9, 10, 11, 12, 12, 13, 12],
            borderColor: "#06b6d4",
            pointBackgroundColor: "#0891b2",
            backgroundColor: "rgba(6,182,212,0.1)",
            fill: false,
            tension: 0.35,
            pointRadius: 2.5,
            borderWidth: 2.2,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8, color: "#334155", padding: 16 },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(148,163,184,0.22)" }, ticks: { color: "#64748b" } },
          x: { grid: { display: false }, ticks: { color: "#64748b" } },
        },
      },
    }),
  )}`;

  const requestStatusDistributionChartUrl = `https://quickchart.io/chart?width=900&height=320&format=png&c=${encodeURIComponent(
    JSON.stringify({
      type: "bar",
      data: {
        labels: ["Approved", "Dispatched", "In Review", "Delayed", "Returned"],
        datasets: [
          {
            label: "Requests",
            data: [18, 14, 9, 5, 3],
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
  )}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Branch Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Branch-level stock and replenishment visibility for phase 6 consumption and restock handling.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Prioritize SKUs with less than 3-day cover and auto-escalate delayed requests to branch lead review.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Low Stock SKUs"
          value="34"
          icon={Boxes}
          colorTheme="indigo"
          trend="+7.1%"
          trendUp
          subText="Urgency prioritized"
        />
        <DashboardStatsCard
          title="Pending Requests"
          value="12"
          icon={Clock3}
          colorTheme="blue"
          trend="+2.3%"
          trendUp
          subText="With ETA tracking"
        />
        <DashboardStatsCard
          title="In-Transit Transfers"
          value="8"
          icon={Truck}
          colorTheme="emerald"
          trend="+4.8%"
          trendUp
          subText="Awaiting receiving"
        />
        <DashboardStatsCard
          title="Receipt Discrepancies"
          value="3"
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-1.1%"
          trendUp={false}
          subText="Latest 7 days"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Stock vs Request Trend</CardTitle>
            <CardDescription>7-day movement of low-stock pressure versus request queue.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={stockVsRequestsTrendChartUrl}
              alt="Stock versus request trend chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-cyan-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Request Status Distribution</CardTitle>
            <CardDescription>Current branch request outcomes by status.</CardDescription>
          </CardHeader>
          <CardContent>
            <img
              src={requestStatusDistributionChartUrl}
              alt="Request status distribution chart"
              className="h-64 w-full rounded-xl border border-slate-200/80 bg-gradient-to-b from-indigo-50/40 to-sky-50/30 object-contain p-2"
              loading="lazy"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Low Stock by Urgency</CardTitle>
            <CardDescription>Critical SKUs requiring immediate restock attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["SKU-TSHIRT-M-BLK", "2 days cover", "Critical"],
              ["SKU-JACKET-L-NAVY", "3 days cover", "High"],
              ["SKU-DENIM-32-BLU", "5 days cover", "Medium"],
            ].map(([sku, info, status]) => (
              <div key={String(sku)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{sku}</p>
                  <p className="text-xs text-slate-500">{info}</p>
                </div>
                <StatusBadge status={String(status)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Pending Requests with ETA</CardTitle>
            <CardDescription>Open restock requests and expected lead windows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["REQ-4102", "ETA 2-3 days", "Approved"],
              ["REQ-4109", "ETA 5-7 days", "Delayed"],
              ["REQ-4113", "ETA 1-2 days", "Dispatched"],
            ].map(([request, eta, status]) => (
              <div key={String(request)} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{request}</p>
                  <p className="text-xs text-slate-500">{eta}</p>
                </div>
                <StatusBadge status={String(status)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
