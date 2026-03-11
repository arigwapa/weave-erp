import { useEffect, useMemo, useState } from "react";
import { RotateCcw, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usersApi, type User } from "../../lib/api/usersApi";
import { rolesApi } from "../../lib/api/rolesApi";
import { TableToolbar } from "../../components/ui/TableToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function ArchivesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  const loadArchived = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await usersApi.listArchived();
      setUsers(userData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load archive records.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArchived();
  }, []);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await rolesApi.list();
        const activeRoleNames = roles
          .filter((role) => role.IsActive)
          .map((role) => role.DisplayName)
          .filter(Boolean);
        setRoleOptions(Array.from(new Set(activeRoleNames)));
      } catch {
        setRoleOptions([]);
      }
    };

    void loadRoles();
  }, []);

  const effectiveRoleOptions = useMemo(() => {
    const set = new Set<string>();
    roleOptions.forEach((role) => {
      if (role.trim()) set.add(role);
    });
    users.forEach((user) => {
      if (user.RoleName?.trim()) set.add(user.RoleName);
    });
    return Array.from(set);
  }, [roleOptions, users]);

  const filteredUsers = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery = !needle
        || `${u.Fullname} ${u.Username} ${u.RoleName} ${u.BranchName ?? ""}`
          .toLowerCase()
          .includes(needle);
      const matchesRole =
        roleFilter === "all" || u.RoleName.toLowerCase() === roleFilter.toLowerCase();
      return matchesQuery && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const restoreUser = async (id: number) => {
    setRestoringId(id);
    try {
      await usersApi.restore(id);
      setUsers((prev) => prev.filter((x) => x.UserID !== id));
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Archives</h1>
        <p className="mt-1 text-sm text-slate-500">
          Centralized archive center for soft-deleted records across account interfaces.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Archive List</CardTitle>
          <CardDescription>
            Review archived records and restore them when needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Filters"
            placeholder="Search archived users..."
            inlineControls={
              <SecondaryButton onClick={() => void loadArchived()}>Refresh</SecondaryButton>
            }
          >
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Role</p>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {effectiveRoleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    Loading archive records...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    No archived users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.UserID}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle2 size={16} className="text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-800">{u.Fullname || u.Username}</p>
                          <p className="text-xs text-slate-500">{u.Username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{u.RoleName || "-"}</TableCell>
                    <TableCell>{u.BranchName || "-"}</TableCell>
                    <TableCell className="text-right">
                      <SecondaryButton
                        icon={RotateCcw}
                        onClick={() => void restoreUser(u.UserID)}
                        disabled={restoringId === u.UserID}
                      >
                        {restoringId === u.UserID ? "Restoring..." : "Restore"}
                      </SecondaryButton>
                    </TableCell>
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
