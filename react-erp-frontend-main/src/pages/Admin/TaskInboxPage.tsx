import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ClipboardList, Eye, ShieldAlert, UserCircle2 } from "lucide-react";
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
import { adminWorkflowApi, type TaskInboxItem } from "../../lib/api/adminWorkflowApi";
import { getApiErrorMessage } from "../../lib/api/handleApiError";

export default function TaskInboxPage() {
  const { role, branchId } = useAuth();
  const [tasks, setTasks] = useState<TaskInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<TaskInboxItem | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    adminWorkflowApi
      .listTaskInbox({ role, branchId })
      .then((items) => {
        if (!mounted) return;
        setTasks(items);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(getApiErrorMessage(err));
        setTasks([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [role, branchId]);

  const filteredTasks = useMemo(() => {
    if (!role) return tasks;
    return tasks.filter((task) => task.Role === role || task.Role === "Admin");
  }, [role, tasks]);

  const visibleTasks = useMemo(
    () =>
      filteredTasks.filter((task) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          task.TaskID.toLowerCase().includes(query) ||
          task.Action.toLowerCase().includes(query) ||
          task.CollectionCode.toLowerCase().includes(query) ||
          task.Role.toLowerCase().includes(query);
        const matchesPriority =
          priorityFilter === "all" || task.Priority.toLowerCase() === priorityFilter.toLowerCase();
        return matchesQuery && matchesPriority;
      }),
    [filteredTasks, searchQuery, priorityFilter]
  );

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(visibleTasks.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, visibleTasks.length);
  const pagedTasks = visibleTasks.slice(startIndex, endIndex);

  const highPriorityCount = visibleTasks.filter((task) => task.Priority === "High").length;
  const dueTodayCount = visibleTasks.filter((task) => task.DueIn.toLowerCase().includes("today")).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Task Inbox</h1>
        <p className="mt-1 text-sm text-slate-500">
          Single place for pending actions, prioritized by role ownership and due window.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          High-priority tasks should be reviewed and assigned before due window breach.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{visibleTasks.length}</p>
            <p className="mt-1 text-xs text-slate-500">Tasks matching current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-rose-700">{highPriorityCount}</p>
            <p className="mt-1 text-xs text-slate-500">Need immediate attention.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{dueTodayCount}</p>
            <p className="mt-1 text-xs text-slate-500">Tasks near SLA deadline.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Pending Actions by Role</CardTitle>
          <CardDescription>
            Active queue for approval, allocation, exception, and follow-up tasks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Priority"
              placeholder="Search task, action, collection, role..."
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setPriorityFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
            >
              <div className="p-3 space-y-2">
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
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>
          </div>

          {isLoading ? (
            <p className="px-6 pb-6 text-sm text-slate-500">Loading pending tasks...</p>
          ) : error ? (
            <p className="px-6 pb-6 text-sm text-red-600">{error}</p>
          ) : visibleTasks.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-slate-500">No pending tasks found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Task ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="pl-6 text-left">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTasks.map((task) => (
                    <TableRow key={task.TaskID}>
                      <TableCell className="px-6">{task.TaskID}</TableCell>
                      <TableCell>{task.Role}</TableCell>
                      <TableCell>{task.Action}</TableCell>
                      <TableCell>{task.CollectionCode}</TableCell>
                      <TableCell>{task.VersionLabel}</TableCell>
                      <TableCell>{task.DueIn}</TableCell>
                      <TableCell>
                        <StatusBadge status={task.Priority} />
                      </TableCell>
                      <TableCell className="pl-6">
                        <SecondaryButton icon={Eye} onClick={() => setSelectedTask(task)}>
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
                totalItems={visibleTasks.length}
                onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
              />
            </>
          )}
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
        itemId={selectedTask?.TaskID ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ClipboardList size={16} />
          </div>
        }
        gridFields={
          selectedTask
            ? [
                { label: "Task ID", value: selectedTask.TaskID, icon: ClipboardList },
                { label: "Role", value: selectedTask.Role, icon: UserCircle2 },
                { label: "Action", value: selectedTask.Action, icon: ShieldAlert },
                { label: "Collection", value: selectedTask.CollectionCode, icon: ClipboardList },
                { label: "Version", value: selectedTask.VersionLabel, icon: ClipboardList },
                { label: "Due", value: selectedTask.DueIn, icon: CalendarClock },
              ]
            : []
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Priority</p>
          <div className="mt-2">
            <StatusBadge status={selectedTask?.Priority ?? "Low"} />
          </div>
        </div>
      </DetailsModal>
    </div>
  );
}
