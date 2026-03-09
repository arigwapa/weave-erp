import { useMemo, useState } from "react";
import { BellRing, CalendarClock, Eye, MessageSquare, ShieldCheck, TimerReset, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import Pagination from "../../components/ui/Pagination";
import DetailsModal from "../../components/ui/DetailsModal";

type RestockStatus = "In Progress" | "Pending" | "At Risk" | "Review";
type QueuePriority = "Critical" | "High" | "Medium";

type RestockRecord = {
  id: string;
  branch: string;
  sourceWarehouse: string;
  itemGroup: string;
  priority: QueuePriority;
  requestedQty: number;
  note: string;
  eta: string;
  status: RestockStatus;
};

const restockQueueData: RestockRecord[] = [
  {
    id: "RQ-3811",
    branch: "Cebu Hub",
    sourceWarehouse: "WH-MNL-01",
    itemGroup: "Packaging Materials",
    priority: "High",
    requestedQty: 320,
    note: "Approved transfer from WH-MNL-01",
    eta: "2026-03-03",
    status: "In Progress",
  },
  {
    id: "RQ-3819",
    branch: "Davao South",
    sourceWarehouse: "WH-CEB-01",
    itemGroup: "Trim Components",
    priority: "Critical",
    requestedQty: 480,
    note: "Partial fulfill pending inbound lot",
    eta: "2026-03-05",
    status: "Pending",
  },
  {
    id: "RQ-3827",
    branch: "Iloilo",
    sourceWarehouse: "WH-MNL-01",
    itemGroup: "Core Fabric",
    priority: "Critical",
    requestedQty: 510,
    note: "Delayed with ETA Mar 04",
    eta: "2026-03-04",
    status: "At Risk",
  },
  {
    id: "RQ-3834",
    branch: "Bacolod",
    sourceWarehouse: "WH-BCD-01",
    itemGroup: "Accessory Kit",
    priority: "Medium",
    requestedQty: 190,
    note: "Waiting branch confirmation",
    eta: "2026-03-06",
    status: "Review",
  },
];

export default function RestockQueuePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState<{
    mode: "notify" | "timeline";
    record: RestockRecord;
  } | null>(null);

  const filteredRecords = useMemo(
    () =>
      restockQueueData.filter((record) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          record.id.toLowerCase().includes(query) ||
          record.branch.toLowerCase().includes(query) ||
          record.sourceWarehouse.toLowerCase().includes(query) ||
          record.itemGroup.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" || record.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesPriority =
          priorityFilter === "all" || record.priority.toLowerCase() === priorityFilter.toLowerCase();

        return matchesQuery && matchesStatus && matchesPriority;
      }),
    [searchQuery, statusFilter, priorityFilter]
  );

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const criticalCount = filteredRecords.filter((record) => record.priority === "Critical").length;
  const atRiskCount = filteredRecords.filter((record) => record.status === "At Risk").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Restock Queue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Prioritized restock workflow with branch communication and automated status notifications.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Branch notification should be logged before timeline closure for critical restock requests.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredRecords.length}</p>
            <p className="mt-1 text-xs text-slate-500">Requests matching current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{criticalCount}</p>
            <p className="mt-1 text-xs text-slate-500">Requests needing urgent processing.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">At Risk Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{atRiskCount}</p>
            <p className="mt-1 text-xs text-slate-500">Potential delays requiring follow-up.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Queue & Branch Communication</CardTitle>
          <CardDescription>
            Track restock status and auto-notify destination branches on updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Filters"
              placeholder="Search request, branch, warehouse, item group..."
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
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
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="at risk">At Risk</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
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
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
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
                <TableHead>Warehouse</TableHead>
                <TableHead>Item Group</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    No restock requests found for selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{record.id}</p>
                      <p className="text-xs text-slate-500">{record.note}</p>
                    </TableCell>
                    <TableCell>{record.branch}</TableCell>
                    <TableCell>{record.sourceWarehouse}</TableCell>
                    <TableCell>{record.itemGroup}</TableCell>
                    <TableCell>{record.priority}</TableCell>
                    <TableCell>{record.eta}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton
                          icon={BellRing}
                          onClick={() => setActiveModal({ mode: "notify", record })}
                        >
                          Notify Branch
                        </SecondaryButton>
                        <SecondaryButton
                          icon={Eye}
                          onClick={() => setActiveModal({ mode: "timeline", record })}
                        >
                          View Timeline
                        </SecondaryButton>
                      </div>
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
            totalItems={filteredRecords.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={activeModal?.mode === "notify" ? "Branch Notification" : "Restock Timeline"}
        itemId={activeModal?.record.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            {activeModal?.mode === "notify" ? <MessageSquare size={16} /> : <TimerReset size={16} />}
          </div>
        }
        gridFields={
          activeModal
            ? [
                { label: "Branch", value: activeModal.record.branch, icon: ShieldCheck },
                { label: "Warehouse", value: activeModal.record.sourceWarehouse, icon: Truck },
                { label: "Priority", value: activeModal.record.priority, icon: ShieldCheck },
                { label: "Status", value: activeModal.record.status, icon: ShieldCheck },
                { label: "ETA", value: activeModal.record.eta, icon: CalendarClock },
                { label: "Item Group", value: activeModal.record.itemGroup, icon: Truck },
              ]
            : []
        }
      >
        {activeModal?.mode === "notify" ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Notification Message</p>
              <p className="mt-1 text-sm text-slate-700">
                Restock request {activeModal.record.id} for {activeModal.record.branch} is currently{" "}
                {activeModal.record.status}. ETA is {activeModal.record.eta}.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <SecondaryButton>Save Draft</SecondaryButton>
              <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
                Send Notification
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Timeline Snapshot</p>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <p>1. Request logged and validated.</p>
                <p>2. Source warehouse confirmed available lot.</p>
                <p>3. Branch acknowledgment pending final dispatch update.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <SecondaryButton>Export Timeline</SecondaryButton>
              <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
                Mark Reviewed
              </PrimaryButton>
            </div>
          </div>
        )}
      </DetailsModal>
    </div>
  );
}
