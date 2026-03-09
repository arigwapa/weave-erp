import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  ListFilter,
  PackageSearch,
  ShieldCheck,
  Truck,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import TabBar from "../../components/ui/TabBar";
import Pagination from "../../components/ui/Pagination";
import DetailsModal from "../../components/ui/DetailsModal";
import SecondaryButton from "../../components/ui/SecondaryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  hydrateRestockRequests,
  loadRestockRequests,
  type RestockRequestRecord,
} from "../../lib/restockRequestStorage";

type TrackerTab = "all" | "open" | "in-transit" | "closed";

export default function RequestTrackerPage() {
  const [requests, setRequests] = useState<RestockRequestRecord[]>(loadRestockRequests());
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TrackerTab>("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RestockRequestRecord | null>(null);

  useEffect(() => {
    // BACKEND-TRACK: hydrate from backend when enabled.
    hydrateRestockRequests().then(setRequests).catch(() => undefined);
    const sync = () => {
      hydrateRestockRequests().then(setRequests).catch(() => setRequests(loadRestockRequests()));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const months = useMemo(
    () => Array.from(new Set(requests.map((item) => item.requestedAt.slice(0, 7)))).sort().reverse(),
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((item) => {
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "open"
            ? item.status === "Pending" || item.status === "In Review"
            : activeTab === "in-transit"
              ? item.status === "Approved" || item.status === "Dispatched"
              : item.status === "Rejected";
      const matchesQuery =
        query.length === 0 ||
        item.id.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.branchName.toLowerCase().includes(query);
      const matchesPriority = priorityFilter === "all" || item.priority.toLowerCase() === priorityFilter;
      const matchesMonth = monthFilter === "all" || item.requestedAt.startsWith(monthFilter);
      return matchesTab && matchesQuery && matchesPriority && matchesMonth;
    });
  }, [requests, activeTab, searchQuery, priorityFilter, monthFilter]);

  const tabs = useMemo(
    () => [
      { id: "all", label: "All", icon: ListFilter, count: requests.length },
      {
        id: "open",
        label: "Open",
        icon: Clock3,
        count: requests.filter((item) => item.status === "Pending" || item.status === "In Review").length,
      },
      {
        id: "in-transit",
        label: "In Transit",
        icon: Truck,
        count: requests.filter((item) => item.status === "Approved" || item.status === "Dispatched").length,
      },
      {
        id: "closed",
        label: "Closed",
        icon: CheckCircle2,
        count: requests.filter((item) => item.status === "Rejected").length,
      },
    ],
    [requests],
  );

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRequests.length);
  const pagedRequests = filteredRequests.slice(startIndex, endIndex);

  const pendingCount = filteredRequests.filter((item) => item.status === "Pending").length;
  const dispatchCount = filteredRequests.filter((item) => item.status === "Dispatched").length;
  const approvedCount = filteredRequests.filter((item) => item.status === "Approved").length;
  const rejectedCount = filteredRequests.filter((item) => item.status === "Rejected").length;

  const etaByStatus = (status: RestockRequestRecord["status"]) => {
    if (status === "Pending") return "ETA 3-5 days";
    if (status === "In Review") return "ETA 2-4 days";
    if (status === "Approved") return "ETA 1-3 days";
    if (status === "Dispatched") return "ETA 1-2 days";
    return "ETA on hold";
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setMonthFilter("all");
    setActiveTab("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Request Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track request lifecycle from submission to dispatch with explicit ETA visibility.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Requests should include priority, ETA guidance, and current status before closure and receiving confirmation.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Visible Requests"
          value={String(filteredRequests.length)}
          icon={PackageSearch}
          colorTheme="indigo"
          trend="+3.0%"
          trendUp
          subText="Current filtered view"
        />
        <DashboardStatsCard
          title="Pending"
          value={String(pendingCount)}
          icon={Clock3}
          colorTheme="blue"
          trend="+1.4%"
          trendUp
          subText="Waiting review"
        />
        <DashboardStatsCard
          title="Approved/Dispatched"
          value={String(approvedCount + dispatchCount)}
          icon={Truck}
          colorTheme="emerald"
          trend="+2.6%"
          trendUp
          subText="In fulfillment pipeline"
        />
        <DashboardStatsCard
          title="Rejected"
          value={String(rejectedCount)}
          icon={ShieldCheck}
          colorTheme="cyan"
          trend="-0.8%"
          trendUp={false}
          subText="Needs re-request"
        />
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Status Timeline</CardTitle>
          <CardDescription>Search and monitor each request from submission through dispatch stages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => {
                setActiveTab(id as TrackerTab);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="px-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              placeholder="Search request ID, SKU, or branch..."
              filterLabel="Filter Timeline"
              inlineControls={<SecondaryButton onClick={resetFilters}>Reset</SecondaryButton>}
            >
              <div className="space-y-3 p-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Priority</p>
                  <Select
                    value={priorityFilter}
                    onValueChange={(value) => {
                      setPriorityFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Month</p>
                  <Select
                    value={monthFilter}
                    onValueChange={(value) => {
                      setMonthFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Request</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>ETA Window</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                    No request timeline records found for selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRequests.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{item.id}</p>
                      <p className="text-xs text-slate-500">{item.sku} ({item.size})</p>
                    </TableCell>
                    <TableCell>{item.branchName}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>{item.requestedAt}</TableCell>
                    <TableCell>{etaByStatus(item.status)}</TableCell>
                    <TableCell className="pl-6">
                      <SecondaryButton
                        icon={Eye}
                        className="!rounded-lg !px-2 !py-2"
                        onClick={() => setSelectedRequest(item)}
                      >
                        <span className="sr-only">View details</span>
                      </SecondaryButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredRequests.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title="Request Timeline Details"
        itemId={selectedRequest?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <PackageSearch size={16} />
          </div>
        }
        gridFields={
          selectedRequest
            ? [
                { label: "Request ID", value: selectedRequest.id, icon: PackageSearch },
                { label: "SKU", value: selectedRequest.sku, icon: PackageSearch },
                { label: "Category", value: selectedRequest.category, icon: PackageSearch },
                { label: "Size", value: selectedRequest.size, icon: ShieldCheck },
                { label: "Priority", value: selectedRequest.priority, icon: ShieldCheck },
                { label: "Status", value: selectedRequest.status, icon: ShieldCheck },
                { label: "Branch", value: selectedRequest.branchName, icon: Building2 },
                { label: "Requested By", value: selectedRequest.requestedBy, icon: UserCircle2 },
                { label: "Requested Qty", value: selectedRequest.requestedQty, icon: ShieldCheck },
                { label: "Requested At", value: selectedRequest.requestedAt, icon: CalendarClock },
                { label: "ETA Window", value: etaByStatus(selectedRequest.status), icon: CalendarClock },
                { label: "Route", value: selectedRequest.targetRole, icon: Truck },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Lifecycle Note</p>
            <p className="mt-1 text-sm text-slate-700">{selectedRequest?.note ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Delay Messaging</p>
            <p className="mt-1 text-sm text-amber-800">
              For delayed fulfillment, notify branch stakeholders immediately with updated ETA and reason code.
            </p>
          </div>
        </div>
      </DetailsModal>
    </div>
  );
}
