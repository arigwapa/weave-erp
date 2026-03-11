import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { useAuth } from "../../lib/AuthContext";
import { auditLogsApi, type AuditLogEntry } from "../../lib/api/auditLogsApi";
import { getApiErrorMessage } from "../../lib/api/handleApiError";
import { rolesApi } from "../../lib/api/rolesApi";

type AuditViewerEntry = {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  reason: string;
  ipAgent: string;
};

function canViewSensitiveAudit(role: string | null): boolean {
  return role === "Admin" || role === "SuperAdmin";
}

function toViewerEntry(item: AuditLogEntry): AuditViewerEntry {
  const actorLabel =
    item.ActorUser.Fullname?.trim() ||
    item.ActorUser.Username ||
    `User ${item.ActorUser.UserID}`;

  return {
    id: `AUD-${item.AuditID}`,
    at: item.PerformedAt,
    actor: actorLabel,
    role: item.ActorUser.RoleName,
    action: item.Action,
    module: item.Module || "Workflow",
    reason: item.NewValue || item.OldValue || "No reason provided.",
    ipAgent: item.IpAddress ?? "N/A",
  };
}

export default function AuditViewerPage() {
  const { role } = useAuth();
  const isPrivileged = canViewSensitiveAudit(role);
  const [entries, setEntries] = useState<AuditViewerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [backendRoleOptions, setBackendRoleOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    const request =
      role === "SuperAdmin"
        ? auditLogsApi.getSuperAdminLogs({ page: 1, pageSize: 100 })
        : auditLogsApi.getBranchAdminLogs({ page: 1, pageSize: 100 });

    request
      .then((response) => {
        if (!mounted) return;
        setEntries(response.Items.map(toViewerEntry));
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(getApiErrorMessage(err));
        setEntries([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [role]);

  useEffect(() => {
    let mounted = true;
    rolesApi
      .list()
      .then((items) => {
        if (!mounted) return;
        const activeRoleNames = Array.from(
          new Set(
            items
              .filter((item) => item.IsActive)
              .map((item) => item.DisplayName)
              .filter(Boolean),
          ),
        );
        setBackendRoleOptions(activeRoleNames);
      })
      .catch(() => {
        if (!mounted) return;
        setBackendRoleOptions([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleEntries = useMemo(() => {
    const withoutSuperAdmin = entries.filter(
      (entry) => entry.role.trim().toLowerCase() !== "superadmin",
    );
    if (isPrivileged) return withoutSuperAdmin;
    return withoutSuperAdmin.filter((entry) => entry.role === role);
  }, [entries, isPrivileged, role]);

  const roleOptions = useMemo(() => {
    const discoveredRoles = visibleEntries.map((entry) => entry.role).filter(Boolean);
    return Array.from(new Set([...backendRoleOptions, ...discoveredRoles]))
      .sort((a, b) => a.localeCompare(b));
  }, [backendRoleOptions, visibleEntries]);

  const filteredEntries = useMemo(
    () =>
      visibleEntries.filter((entry) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          entry.id.toLowerCase().includes(query) ||
          entry.actor.toLowerCase().includes(query) ||
          entry.action.toLowerCase().includes(query) ||
          entry.reason.toLowerCase().includes(query);
        const matchesRole = roleFilter === "all" || entry.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesQuery && matchesRole;
      }),
    [visibleEntries, searchQuery, roleFilter],
  );

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredEntries.length);
  const pagedEntries = filteredEntries.slice(startIndex, endIndex);

  const restrictedFieldsCount = isPrivileged ? 0 : filteredEntries.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Viewer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Role-restricted audit access with full traceability for compliance workflows.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Audit records are immutable and must keep actor, action, timestamp, and reason for compliance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredEntries.length}</p>
            <p className="mt-1 text-xs text-slate-500">Audit records matching current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Access Level</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={isPrivileged ? "Full access" : "Scoped access"} />
            <p className="mt-1 text-xs text-slate-500">Privilege-based visibility policy applied.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Restricted Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{restrictedFieldsCount}</p>
            <p className="mt-1 text-xs text-slate-500">Entries with masked IP/agent for scoped roles.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Audit Events</CardTitle>
          <CardDescription>
            Immutable records with actor, action, reason, and role-based metadata visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Role"
              placeholder="Search event ID, actor, action, reason..."
              inlineControls={undefined}
            >
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Actor Role</p>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {roleOptions.map((itemRole) => (
                      <SelectItem key={itemRole} value={itemRole}>
                        {itemRole}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>
          </div>

          {isLoading ? (
            <p className="px-6 pb-6 text-sm text-slate-500">Loading audit logs...</p>
          ) : error ? (
            <p className="px-6 pb-6 text-sm text-red-600">{error}</p>
          ) : filteredEntries.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-slate-500">No audit records found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Event ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>IP / Agent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="px-6">{entry.id}</TableCell>
                      <TableCell>{entry.at}</TableCell>
                      <TableCell>{entry.actor}</TableCell>
                      <TableCell>{entry.role}</TableCell>
                      <TableCell>{entry.module}</TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell className="max-w-[320px] truncate" title={entry.reason}>
                        {entry.reason}
                      </TableCell>
                      <TableCell>{isPrivileged ? entry.ipAgent : "Restricted"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredEntries.length}
                onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
