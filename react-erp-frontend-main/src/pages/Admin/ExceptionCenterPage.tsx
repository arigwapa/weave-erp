import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Eye, Siren, ShieldAlert, UserCircle2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import DetailsModal from "../../components/ui/DetailsModal";

type ExceptionSeverity = "Critical" | "High" | "At Risk" | "Review";
type ExceptionStatus = "Open" | "In Progress" | "Escalated" | "Resolved";

type ExceptionRecord = {
  id: string;
  title: string;
  category: "QA" | "Finance" | "Approval";
  detail: string;
  owner: string;
  dueDate: string;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
};

const exceptionData: ExceptionRecord[] = [
  {
    id: "EXC-4412",
    title: "QA failure spike",
    category: "QA",
    detail: "Branch: Davao South, +23% week-over-week",
    owner: "Angela Dela Cruz",
    dueDate: "2026-03-04",
    severity: "Critical",
    status: "Open",
  },
  {
    id: "EXC-4399",
    title: "Budget variance > threshold",
    category: "Finance",
    detail: "Collection CO-2026-022 exceeded 11.8%",
    owner: "Mika Salazar",
    dueDate: "2026-03-05",
    severity: "At Risk",
    status: "In Progress",
  },
  {
    id: "EXC-4388",
    title: "Overdue approvals",
    category: "Approval",
    detail: "9 approvals breached SLA > 48h",
    owner: "Jose Lim",
    dueDate: "2026-03-03",
    severity: "High",
    status: "Escalated",
  },
  {
    id: "EXC-4371",
    title: "Inventory count mismatch",
    category: "Finance",
    detail: "Reconciliation variance detected in weekly cycle count",
    owner: "Harold Ventura",
    dueDate: "2026-03-06",
    severity: "Review",
    status: "Open",
  },
];

export default function ExceptionCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<ExceptionRecord | null>(null);
  const [isPlaybookModalOpen, setIsPlaybookModalOpen] = useState(false);
  const [ownerInput, setOwnerInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");
  const [escalationInput, setEscalationInput] = useState("");

  const filteredRecords = useMemo(
    () =>
      exceptionData.filter((record) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          record.id.toLowerCase().includes(query) ||
          record.title.toLowerCase().includes(query) ||
          record.detail.toLowerCase().includes(query) ||
          record.owner.toLowerCase().includes(query);

        const matchesSeverity =
          severityFilter === "all" || record.severity.toLowerCase() === severityFilter.toLowerCase();
        const matchesStatus =
          statusFilter === "all" || record.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesQuery && matchesSeverity && matchesStatus;
      }),
    [searchQuery, severityFilter, statusFilter]
  );

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const criticalCount = filteredRecords.filter((record) => record.severity === "Critical").length;
  const escalatedCount = filteredRecords.filter((record) => record.status === "Escalated").length;

  const openPlaybookModal = (record: ExceptionRecord) => {
    setSelectedRecord(record);
    setOwnerInput(record.owner);
    setDueDateInput(record.dueDate);
    setEscalationInput("Escalate to Superadmin");
    setIsPlaybookModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Exception Center</h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor critical alerts and execute playbook actions with ownership and escalation paths.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Critical exceptions must have an owner, due date, and escalation path before closure.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Exceptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredRecords.length}</p>
            <p className="mt-1 text-xs text-slate-500">Exceptions matching current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{criticalCount}</p>
            <p className="mt-1 text-xs text-slate-500">Immediate attention required.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Escalated Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{escalatedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Already raised to higher authority.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Alerts</CardTitle>
          <CardDescription>
            QA failure spikes, budget variance threshold breaches, and overdue approvals.
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
              placeholder="Search ID, title, detail, or owner..."
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setSeverityFilter("all");
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
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Severity</p>
                  <Select
                    value={severityFilter}
                    onValueChange={(value) => {
                      setSeverityFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="at risk">At Risk</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
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
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Exception</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                    No exceptions found for selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{record.title}</p>
                      <p className="text-xs text-slate-500">{record.id} • {record.detail}</p>
                    </TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>{record.owner}</TableCell>
                    <TableCell>{record.dueDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.severity} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton icon={Eye} onClick={() => setSelectedRecord(record)}>
                          Details
                        </SecondaryButton>
                        <SecondaryButton icon={Siren} onClick={() => openPlaybookModal(record)}>
                          Playbook Action
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
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        title="Exception Details"
        itemId={selectedRecord?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ShieldAlert size={16} />
          </div>
        }
        gridFields={
          selectedRecord
            ? [
                { label: "Title", value: selectedRecord.title, icon: AlertTriangle },
                { label: "Category", value: selectedRecord.category, icon: ShieldAlert },
                { label: "Owner", value: selectedRecord.owner, icon: UserCircle2 },
                { label: "Due Date", value: selectedRecord.dueDate, icon: CalendarClock },
                { label: "Severity", value: selectedRecord.severity, icon: AlertTriangle },
                { label: "Status", value: selectedRecord.status, icon: ShieldAlert },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Exception Context</p>
            <p className="mt-1 text-sm text-slate-700">{selectedRecord?.detail ?? "-"}</p>
          </div>
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={isPlaybookModalOpen && selectedRecord !== null}
        onClose={() => setIsPlaybookModalOpen(false)}
        title="Playbook Action"
        itemId={selectedRecord?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <Siren size={16} />
          </div>
        }
        gridFields={
          selectedRecord
            ? [
                { label: "Exception", value: selectedRecord.title, icon: AlertTriangle },
                { label: "Severity", value: selectedRecord.severity, icon: AlertTriangle },
                { label: "Status", value: selectedRecord.status, icon: ShieldAlert },
                { label: "Current Owner", value: selectedRecord.owner, icon: UserCircle2 },
              ]
            : []
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assign Owner</p>
            <Input value={ownerInput} onChange={(e) => setOwnerInput(e.target.value)} placeholder="Owner name" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
            <Input type="date" value={dueDateInput} onChange={(e) => setDueDateInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Escalation</p>
            <Select value={escalationInput} onValueChange={setEscalationInput}>
              <SelectTrigger>
                <SelectValue placeholder="Choose escalation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Escalate to Superadmin">Escalate to Superadmin</SelectItem>
                <SelectItem value="Escalate to QA Lead">Escalate to QA Lead</SelectItem>
                <SelectItem value="Escalate to Finance Lead">Escalate to Finance Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <SecondaryButton>Save Draft</SecondaryButton>
          <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            Run Playbook
          </PrimaryButton>
        </div>
      </DetailsModal>
    </div>
  );
}
