import { useEffect, useMemo, useState } from "react";
import { Building2, CalendarClock, Eye, PackageSearch, ShieldCheck, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import DetailsModal from "../../components/ui/DetailsModal";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
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
  type RestockPriority,
  type RestockRequestRecord,
} from "../../lib/restockRequestStorage";

export default function RestockRequestPage() {
  const [requests, setRequests] = useState<RestockRequestRecord[]>(loadRestockRequests());
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filteredRequests = useMemo(
    () =>
      requests.filter((item) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery =
          query.length === 0 ||
          item.id.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.branchName.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
        const matchesPriority = priorityFilter === "all" || item.priority.toLowerCase() === priorityFilter;
        const matchesMonth = monthFilter === "all" || item.requestedAt.startsWith(monthFilter);
        return matchesQuery && matchesStatus && matchesPriority && matchesMonth;
      }),
    [requests, searchQuery, statusFilter, priorityFilter, monthFilter],
  );

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRequests.length);
  const pagedRequests = filteredRequests.slice(startIndex, endIndex);

  const pendingCount = filteredRequests.filter((item) => item.status === "Pending").length;
  const criticalCount = filteredRequests.filter((item) => item.priority === "Critical").length;

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setMonthFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Restock Request List</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all restock requests submitted from inventory low-stock actions and track admin routing status.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          All restock requests should include priority and reason before admin review can begin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredRequests.length}</p>
            <p className="mt-1 text-xs text-slate-500">Requests matching active filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Admin Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{pendingCount}</p>
            <p className="mt-1 text-xs text-slate-500">Waiting for admin processing.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{criticalCount}</p>
            <p className="mt-1 text-xs text-slate-500">Urgent requests with highest impact.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Restock Requests</CardTitle>
          <CardDescription>Search, filter, and review submitted requests from branch inventory.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              placeholder="Search by request ID, SKU, category, or branch..."
              filterLabel="Filter Requests"
              inlineControls={<SecondaryButton onClick={resetFilters}>Reset</SecondaryButton>}
            >
              <div className="space-y-3 p-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                <TableHead>SKU</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    No restock requests found for current search/filter.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRequests.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{item.id}</p>
                      <p className="text-xs text-slate-500">{item.branchName}</p>
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell>{item.requestedQty}</TableCell>
                    <TableCell>{item.priority}</TableCell>
                    <TableCell>{item.requestedAt}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
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
        title="Restock Request Details"
        itemId={selectedRequest?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <PackageSearch size={16} />
          </div>
        }
        gridFields={
          selectedRequest
            ? [
                { label: "SKU", value: selectedRequest.sku, icon: PackageSearch },
                { label: "Category", value: selectedRequest.category, icon: PackageSearch },
                { label: "Size", value: selectedRequest.size, icon: ShieldCheck },
                { label: "Requested Qty", value: selectedRequest.requestedQty, icon: ShieldCheck },
                { label: "Priority", value: selectedRequest.priority as RestockPriority, icon: ShieldCheck },
                { label: "Status", value: selectedRequest.status, icon: ShieldCheck },
                { label: "Requested By", value: selectedRequest.requestedBy, icon: UserCircle2 },
                { label: "Branch", value: selectedRequest.branchName, icon: Building2 },
                { label: "On-Hand", value: selectedRequest.onHand, icon: ShieldCheck },
                { label: "Reorder Level", value: selectedRequest.reorderLevel, icon: ShieldCheck },
                { label: "Requested At", value: selectedRequest.requestedAt, icon: CalendarClock },
                { label: "Route", value: selectedRequest.targetRole, icon: ShieldCheck },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Request Note</p>
            <p className="mt-1 text-sm text-slate-700">{selectedRequest?.note || "-"}</p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <p className="text-xs font-semibold uppercase text-indigo-600">Workflow Note</p>
            <p className="mt-1 text-sm text-indigo-700">
              This request is routed to Admin for review, approval, and dispatch coordination.
            </p>
          </div>
        </div>
      </DetailsModal>
    </div>
  );
}
