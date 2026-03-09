import { useMemo, useState } from "react";
import {
  CalendarClock,
  Eye,
  GitCompareArrows,
  Layers3,
  Lock,
  ShieldCheck,
  Unlock,
  UserCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { TableToolbar } from "../../components/ui/TableToolbar";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Pagination from "../../components/ui/Pagination";
import DetailsModal from "../../components/ui/DetailsModal";

type VersionRecord = {
  id: string;
  version: string;
  releaseTag: string;
  changeType: "BOM" | "Costing" | "Instruction" | "Mixed";
  changedBy: string;
  updatedAt: string;
  costImpact: string;
  status: "Approved" | "In Progress" | "Pending" | "At Risk";
  lockState: "Locked" | "Unlocked";
  notes: string;
};

const versionRecords: VersionRecord[] = [
  {
    id: "VER-24019",
    version: "V5",
    releaseTag: "Spring Capsule",
    changeType: "Mixed",
    changedBy: "Angela Dela Cruz",
    updatedAt: "2026-03-02 10:32",
    costImpact: "+PHP 65,000",
    status: "In Progress",
    lockState: "Unlocked",
    notes: "Updated BOM and QA release notes for zipper tolerance and finishing requirements.",
  },
  {
    id: "VER-24012",
    version: "V4",
    releaseTag: "Retail Core",
    changeType: "Costing",
    changedBy: "Mika Salazar",
    updatedAt: "2026-03-01 15:05",
    costImpact: "+PHP 90,000",
    status: "Approved",
    lockState: "Locked",
    notes: "Material repricing applied for leather and adhesive procurement.",
  },
  {
    id: "VER-24008",
    version: "V3",
    releaseTag: "Warehouse Transfer Batch",
    changeType: "Instruction",
    changedBy: "Jose Lim",
    updatedAt: "2026-03-01 09:48",
    costImpact: "No Change",
    status: "Pending",
    lockState: "Unlocked",
    notes: "Added handling instruction updates for inter-branch transfer packaging.",
  },
  {
    id: "VER-23997",
    version: "V2",
    releaseTag: "Uniform Rollout",
    changeType: "BOM",
    changedBy: "Harold Ventura",
    updatedAt: "2026-02-29 17:22",
    costImpact: "-PHP 20,000",
    status: "At Risk",
    lockState: "Unlocked",
    notes: "Deprecated low-availability trims and replaced with approved alternatives.",
  },
  {
    id: "VER-23981",
    version: "V1",
    releaseTag: "Pilot Launch",
    changeType: "BOM",
    changedBy: "Katrina Ong",
    updatedAt: "2026-02-28 13:11",
    costImpact: "Baseline",
    status: "Approved",
    lockState: "Locked",
    notes: "Initial approved baseline for pilot release.",
  },
];

export default function VersionControlPage() {
  const [records, setRecords] = useState<VersionRecord[]>(versionRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [lockFilter, setLockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsRecord, setDetailsRecord] = useState<VersionRecord | null>(null);
  const [compareRecord, setCompareRecord] = useState<VersionRecord | null>(null);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          record.version.toLowerCase().includes(query) ||
          record.id.toLowerCase().includes(query) ||
          record.releaseTag.toLowerCase().includes(query) ||
          record.changedBy.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" || record.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesLock =
          lockFilter === "all" || record.lockState.toLowerCase() === lockFilter.toLowerCase();

        return matchesQuery && matchesStatus && matchesLock;
      }),
    [records, searchQuery, statusFilter, lockFilter]
  );

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const approvedCount = filteredRecords.filter((record) => record.status === "Approved").length;
  const lockedCount = filteredRecords.filter((record) => record.lockState === "Locked").length;

  const toggleLockState = (recordId: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId
          ? {
              ...record,
              lockState: record.lockState === "Locked" ? "Unlocked" : "Locked",
            }
          : record
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Version Control</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track version evolution, review release impact, and enforce lock governance before deployment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            <Lock size={14} />
            Lock Selected Version
          </PrimaryButton>
          <SecondaryButton icon={Unlock}>Unlock (Admin Override)</SecondaryButton>
        </div>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Locked versions cannot be edited unless an admin override is explicitly recorded.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredRecords.length}</p>
            <p className="mt-1 text-xs text-slate-500">Records matching current search and filters.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{approvedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Versions ready for release use.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Locked Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{lockedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Protected from further changes.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Version Records</CardTitle>
          <CardDescription>Structured list of changes, approvals, and lock state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Filters"
              placeholder="Search version, ID, release tag, or owner..."
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setLockFilter("all");
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
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="at risk">At Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lock State</p>
                  <Select
                    value={lockFilter}
                    onValueChange={(value) => {
                      setLockFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All lock states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="locked">Locked</SelectItem>
                      <SelectItem value="unlocked">Unlocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Version</TableHead>
                <TableHead>Release Tag</TableHead>
                <TableHead>Change Type</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Cost Impact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lock</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                    No version records found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{record.version}</p>
                      <p className="text-xs text-slate-500">{record.id}</p>
                    </TableCell>
                    <TableCell>{record.releaseTag}</TableCell>
                    <TableCell>{record.changeType}</TableCell>
                    <TableCell>{record.changedBy}</TableCell>
                    <TableCell>{record.updatedAt}</TableCell>
                    <TableCell>{record.costImpact}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={record.lockState} />
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton
                          icon={Eye}
                          ariaLabel={`Open details for ${record.version}`}
                          className="!rounded-lg !px-2 !py-2"
                          onClick={() => setDetailsRecord(record)}
                        >
                          <span className="sr-only">Details</span>
                        </SecondaryButton>
                        <SecondaryButton
                          icon={GitCompareArrows}
                          onClick={() => setCompareRecord(record)}
                        >
                          Compare
                        </SecondaryButton>
                        <button
                          type="button"
                          aria-label={
                            record.lockState === "Locked"
                              ? `Unlock ${record.version}`
                              : `Lock ${record.version}`
                          }
                          onClick={() => toggleLockState(record.id)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                            record.lockState === "Locked"
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {record.lockState === "Locked" ? <Unlock size={14} /> : <Lock size={14} />}
                          {record.lockState === "Locked" ? "Unlock" : "Lock"}
                        </button>
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
        isOpen={detailsRecord !== null}
        onClose={() => setDetailsRecord(null)}
        title="Version Details"
        itemId={detailsRecord?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Eye size={16} />
          </div>
        }
        gridFields={
          detailsRecord
            ? [
                { label: "Version", value: detailsRecord.version, icon: Layers3 },
                { label: "Release Tag", value: detailsRecord.releaseTag, icon: GitCompareArrows },
                { label: "Changed By", value: detailsRecord.changedBy, icon: UserCircle2 },
                { label: "Updated At", value: detailsRecord.updatedAt, icon: CalendarClock },
                { label: "Status", value: detailsRecord.status, icon: ShieldCheck },
                { label: "Lock", value: detailsRecord.lockState, icon: Lock },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Change Summary</p>
            <p className="mt-1 text-sm text-slate-700">{detailsRecord?.notes ?? "-"}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <SecondaryButton icon={Unlock}>Unlock Version</SecondaryButton>
            <PrimaryButton className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
              <Lock size={14} />
              Lock Version
            </PrimaryButton>
          </div>
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={compareRecord !== null}
        onClose={() => setCompareRecord(null)}
        title="Version Compare"
        itemId={compareRecord?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <GitCompareArrows size={16} />
          </div>
        }
        gridFields={
          compareRecord
            ? [
                { label: "Version", value: compareRecord.version, icon: Layers3 },
                { label: "Release Tag", value: compareRecord.releaseTag, icon: GitCompareArrows },
                { label: "Change Type", value: compareRecord.changeType, icon: GitCompareArrows },
                { label: "Status", value: compareRecord.status, icon: ShieldCheck },
              ]
            : []
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Previous Version</p>
            <p className="mt-2 text-sm text-slate-700">Cost Impact: {(compareRecord?.costImpact ?? "No Change").replace("+", "")}</p>
            <p className="text-sm text-slate-700">Lock State: Locked</p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <p className="text-xs font-semibold uppercase text-indigo-600">
              Current ({compareRecord?.version ?? "Latest"})
            </p>
            <p className="mt-2 text-sm text-slate-700">Cost Impact: {compareRecord?.costImpact ?? "No Change"}</p>
            <p className="text-sm text-slate-700">Lock State: {compareRecord?.lockState ?? "Unlocked"}</p>
          </div>
        </div>
      </DetailsModal>
    </div>
  );
}
