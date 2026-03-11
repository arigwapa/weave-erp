import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import { auditLogsApi, type AuditLogEntry } from "../../lib/api/auditLogsApi";

type AuditLogRow = {
  id: number;
  performedBy: string;
  action: string;
  description: string;
  datePerformed: string;
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function toDescription(entry: AuditLogEntry): string {
  const oldValue = entry.OldValue?.trim();
  const newValue = entry.NewValue?.trim();
  if (oldValue && newValue) {
    return `${oldValue} -> ${newValue}`;
  }
  if (newValue) return newValue;
  if (oldValue) return oldValue;
  return `${entry.Action} on user ${entry.AffectedUser?.Fullname || entry.AffectedUser?.Username || "-"}`;
}

export default function ActivityMonitorPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const response = await auditLogsApi.getSuperAdminLogs({ page: 1, pageSize: 100 });
        setLogs(Array.isArray(response.Items) ? response.Items : []);
      } catch {
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadLogs();
  }, []);

  const rows = useMemo<AuditLogRow[]>(
    () =>
      logs.map((entry) => ({
        id: entry.AuditID,
        performedBy: [entry.ActorUser?.Fullname || entry.ActorUser?.Username || "-", entry.ActorUser?.RoleName]
          .filter(Boolean)
          .join(" • "),
        action: entry.Action || "-",
        description: toDescription(entry),
        datePerformed: formatDateTime(entry.PerformedAt),
      })),
    [logs],
  );

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      `${row.id} ${row.performedBy} ${row.action} ${row.description} ${row.datePerformed}`
        .toLowerCase()
        .includes(query),
    );
  }, [rows, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track account activities across user and security operations.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Account Activity Logs</CardTitle>
          <CardDescription>
            Super Admin visibility of all account actions and activity history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              placeholder="Search audit logs..."
              filterLabel="Search"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">ID</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Performed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No audit log records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-6 font-medium text-slate-800">{row.id}</TableCell>
                    <TableCell>{row.performedBy}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell className="text-slate-600">{row.datePerformed}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
