import { useMemo, useState } from "react";
import { CalendarClock, ShieldAlert, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DetailsModal from "../../components/ui/DetailsModal";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";

type AllocationPriority = "Critical" | "High" | "Medium";
type AllocationStatus = "At Risk" | "Pending" | "Review" | "In Progress";

type AllocationRecord = {
  id: string;
  branch: string;
  priority: AllocationPriority;
  stockRisk: number;
  availableUnits: number;
  requiredUnits: number;
  sourceWarehouse: string;
  destinationBranch: string;
  status: AllocationStatus;
};

const allocationQueue: AllocationRecord[] = [
  {
    id: "ALLOC-9012",
    branch: "Davao South",
    priority: "Critical",
    stockRisk: 91,
    availableUnits: 120,
    requiredUnits: 260,
    sourceWarehouse: "WH-MNL-01",
    destinationBranch: "Davao South",
    status: "At Risk",
  },
  {
    id: "ALLOC-9008",
    branch: "Cebu Hub",
    priority: "High",
    stockRisk: 82,
    availableUnits: 220,
    requiredUnits: 310,
    sourceWarehouse: "WH-CEB-01",
    destinationBranch: "Cebu Hub",
    status: "Pending",
  },
  {
    id: "ALLOC-8996",
    branch: "Iloilo",
    priority: "Medium",
    stockRisk: 68,
    availableUnits: 260,
    requiredUnits: 320,
    sourceWarehouse: "WH-BCD-01",
    destinationBranch: "Iloilo",
    status: "Review",
  },
  {
    id: "ALLOC-8989",
    branch: "Bacolod",
    priority: "High",
    stockRisk: 74,
    availableUnits: 180,
    requiredUnits: 260,
    sourceWarehouse: "WH-MNL-01",
    destinationBranch: "Bacolod",
    status: "In Progress",
  },
];

export default function InventoryAllocationPage() {
  const [records] = useState<AllocationRecord[]>(allocationQueue);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AllocationRecord | null>(null);
  const [workflowRecord, setWorkflowRecord] = useState<AllocationRecord | null>(null);
  const [decision, setDecision] = useState("");
  const [etaNote, setEtaNote] = useState("");
  const [sourceWarehouse, setSourceWarehouse] = useState("WH-MNL-01");
  const [destinationBranch, setDestinationBranch] = useState("Davao South");
  const [dispatchDate, setDispatchDate] = useState("");
  const [etaDate, setEtaDate] = useState("");

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          record.branch.toLowerCase().includes(query) ||
          record.id.toLowerCase().includes(query) ||
          record.sourceWarehouse.toLowerCase().includes(query);

        const matchesPriority =
          priorityFilter === "all" || record.priority.toLowerCase() === priorityFilter.toLowerCase();
        const matchesStatus =
          statusFilter === "all" || record.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesQuery && matchesPriority && matchesStatus;
      }),
    [records, searchQuery, priorityFilter, statusFilter]
  );

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const criticalCount = filteredRecords.filter((record) => record.priority === "Critical").length;
  const avgRisk = filteredRecords.length
    ? Math.round(filteredRecords.reduce((sum, record) => sum + record.stockRisk, 0) / filteredRecords.length)
    : 0;
  const sourceWarehouseOptions = Array.from(new Set(records.map((record) => record.sourceWarehouse)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Inventory Allocation</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage stock transfer decisions with priority scoring, decision workflow, and dispatch planning.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Critical allocation requests must include both a decision and a dispatch plan before release.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredRecords.length}</p>
            <p className="mt-1 text-xs text-slate-500">Requests visible under current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{criticalCount}</p>
            <p className="mt-1 text-xs text-slate-500">Need immediate allocation action.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Stock Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{avgRisk}%</p>
            <p className="mt-1 text-xs text-slate-500">Across filtered allocation requests.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Priority Queue by Stock Risk</CardTitle>
          <CardDescription>Review request severity, stock gap, and allocation status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Filters"
              placeholder="Search branch, request id, warehouse..."
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setPriorityFilter("all");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
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
                      <SelectItem value="at risk">At Risk</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Branch</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Stock Risk</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Gap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    No allocation requests found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{record.branch}</p>
                      <p className="text-xs text-slate-500">{record.id}</p>
                    </TableCell>
                    <TableCell>{record.priority}</TableCell>
                    <TableCell>{record.stockRisk}%</TableCell>
                    <TableCell>{record.availableUnits}</TableCell>
                    <TableCell>{record.requiredUnits}</TableCell>
                    <TableCell className="font-medium text-rose-700">
                      {Math.max(record.requiredUnits - record.availableUnits, 0)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton
                          onClick={() => {
                            setWorkflowRecord(record);
                            setDecision("");
                            setEtaNote("");
                            setSourceWarehouse(record.sourceWarehouse);
                            setDestinationBranch(record.destinationBranch);
                          }}
                        >
                          Decision Workflow
                        </SecondaryButton>
                        <SecondaryButton
                          ariaLabel={`Open allocation details for ${record.branch}`}
                          onClick={() => {
                            setSelectedRecord(record);
                            setSourceWarehouse(record.sourceWarehouse);
                            setDestinationBranch(record.destinationBranch);
                          }}
                        >
                          Allocation
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
        isOpen={workflowRecord !== null}
        onClose={() => setWorkflowRecord(null)}
        title="Decision Workflow"
        itemId={workflowRecord?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <CalendarClock size={16} />
          </div>
        }
        gridFields={
          workflowRecord
            ? [
                { label: "Branch", value: workflowRecord.branch, icon: ShieldAlert },
                { label: "Priority", value: workflowRecord.priority, icon: ShieldAlert },
                { label: "Stock Risk", value: `${workflowRecord.stockRisk}%`, icon: ShieldAlert },
                { label: "Status", value: workflowRecord.status, icon: ShieldAlert },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Decision</p>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve-transfer">Approve transfer</SelectItem>
                <SelectItem value="partial-fulfill">Partial fulfill</SelectItem>
                <SelectItem value="delay-eta">Delay with ETA note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ETA Note</p>
            <Input
              value={etaNote}
              onChange={(e) => setEtaNote(e.target.value)}
              placeholder="e.g. Dispatch moved to Mar 03 due to inbound delay"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <SecondaryButton
              onClick={() => {
                setDecision("");
                setEtaNote("");
              }}
            >
              Clear
            </SecondaryButton>
            <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
              Submit Decision
            </PrimaryButton>
          </div>
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        title="Allocation Details"
        itemId={selectedRecord?.id ?? "-"}
        footerActions={
          <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            Confirm Allocation
          </PrimaryButton>
        }
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ShieldAlert size={16} />
          </div>
        }
        gridFields={
          selectedRecord
            ? [
                { label: "Branch", value: selectedRecord.branch, icon: ShieldAlert },
                { label: "Priority", value: selectedRecord.priority, icon: ShieldAlert },
                { label: "Stock Risk", value: `${selectedRecord.stockRisk}%`, icon: ShieldAlert },
                { label: "Status", value: selectedRecord.status, icon: ShieldAlert },
                { label: "Source", value: selectedRecord.sourceWarehouse, icon: Truck },
                { label: "Destination", value: selectedRecord.destinationBranch, icon: Truck },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Gap Summary</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Required: {selectedRecord?.requiredUnits ?? 0} units
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Available: {selectedRecord?.availableUnits ?? 0} units
              </span>
              <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                Gap: {selectedRecord ? Math.max(selectedRecord.requiredUnits - selectedRecord.availableUnits, 0) : 0} units
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dispatch Planner</p>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source Warehouse</p>
              <Select value={sourceWarehouse} onValueChange={setSourceWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {sourceWarehouseOptions.map((warehouse) => (
                    <SelectItem key={warehouse} value={warehouse}>
                      {warehouse}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Destination Branch</p>
              <Input
                value={destinationBranch}
                onChange={(e) => setDestinationBranch(e.target.value)}
                placeholder="Davao South"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dispatch Date</p>
                <Input type="date" value={dispatchDate} onChange={(e) => setDispatchDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ETA</p>
                <Input type="date" value={etaDate} onChange={(e) => setEtaDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <SecondaryButton>Save Dispatch Plan</SecondaryButton>
          </div>
        </div>
      </DetailsModal>
    </div>
  );
}
