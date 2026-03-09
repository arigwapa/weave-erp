import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Eye, GitBranch, ShieldCheck, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import DetailsModal from "../../components/ui/DetailsModal";
import { useAuth } from "../../lib/AuthContext";
import { adminWorkflowApi, type WorkflowTimelineItem } from "../../lib/api/adminWorkflowApi";
import { getApiErrorMessage } from "../../lib/api/handleApiError";

export default function WorkflowTimelinePage() {
  const { role, branchId } = useAuth();
  const [timeline, setTimeline] = useState<WorkflowTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<WorkflowTimelineItem | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    adminWorkflowApi
      .listWorkflowTimeline({ role, branchId })
      .then((items) => {
        if (!mounted) return;
        setTimeline(items);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(getApiErrorMessage(err));
        setTimeline([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [role, branchId]);

  const visibleTimeline = useMemo(
    () =>
      timeline.filter((event) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          event.EventID.toLowerCase().includes(query) ||
          event.CollectionCode.toLowerCase().includes(query) ||
          event.Stage.toLowerCase().includes(query) ||
          event.OwnerRole.toLowerCase().includes(query);
        const matchesStatus =
          statusFilter === "all" || event.Status.toLowerCase() === statusFilter.toLowerCase();
        return matchesQuery && matchesStatus;
      }),
    [timeline, searchQuery, statusFilter]
  );

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(visibleTimeline.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, visibleTimeline.length);
  const pagedTimeline = visibleTimeline.slice(startIndex, endIndex);

  const doneCount = visibleTimeline.filter((event) => event.Status === "Done").length;
  const blockedCount = visibleTimeline.filter((event) => event.Status === "Blocked").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Workflow Timeline</h1>
        <p className="mt-1 text-sm text-slate-500">
          End-to-end history for each collection and version across all workflow gates.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Blocked timeline steps must include owner review and escalation notes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{visibleTimeline.length}</p>
            <p className="mt-1 text-xs text-slate-500">Events in current timeline view.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{doneCount}</p>
            <p className="mt-1 text-xs text-slate-500">Steps finished successfully.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{blockedCount}</p>
            <p className="mt-1 text-xs text-slate-500">Steps requiring intervention.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection / Version Timeline</CardTitle>
          <CardDescription>
            Complete trace from submission through approvals, allocations, and release handoffs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Status"
              placeholder="Search event, collection, stage, owner..."
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
            >
              <div className="p-3 space-y-2">
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
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>
          </div>

          {isLoading ? (
            <p className="px-6 pb-6 text-sm text-slate-500">Loading workflow timeline...</p>
          ) : error ? (
            <p className="px-6 pb-6 text-sm text-red-600">{error}</p>
          ) : visibleTimeline.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-slate-500">No workflow events found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Event ID</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pl-6 text-left">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTimeline.map((event) => (
                    <TableRow key={event.EventID}>
                      <TableCell className="px-6">{event.EventID}</TableCell>
                      <TableCell>{event.CollectionCode}</TableCell>
                      <TableCell>{event.VersionLabel}</TableCell>
                      <TableCell>{event.Stage}</TableCell>
                      <TableCell>{event.OwnerRole}</TableCell>
                      <TableCell>{event.Timestamp}</TableCell>
                      <TableCell>
                        <StatusBadge status={event.Status} />
                      </TableCell>
                      <TableCell className="pl-6">
                        <SecondaryButton icon={Eye} onClick={() => setSelectedEvent(event)}>
                          Details
                        </SecondaryButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={visibleTimeline.length}
                onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title="Timeline Event Details"
        itemId={selectedEvent?.EventID ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <GitBranch size={16} />
          </div>
        }
        gridFields={
          selectedEvent
            ? [
                { label: "Collection", value: selectedEvent.CollectionCode, icon: GitBranch },
                { label: "Version", value: selectedEvent.VersionLabel, icon: GitBranch },
                { label: "Stage", value: selectedEvent.Stage, icon: ShieldCheck },
                { label: "Owner", value: selectedEvent.OwnerRole, icon: UserCircle2 },
                { label: "Timestamp", value: selectedEvent.Timestamp, icon: CalendarClock },
                { label: "Status", value: selectedEvent.Status, icon: ShieldCheck },
              ]
            : []
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Event Summary</p>
          <p className="mt-1 text-sm text-slate-700">
            {selectedEvent?.CollectionCode} {selectedEvent?.VersionLabel} is currently in{" "}
            {selectedEvent?.Stage} under {selectedEvent?.OwnerRole}.
          </p>
        </div>
      </DetailsModal>
    </div>
  );
}
