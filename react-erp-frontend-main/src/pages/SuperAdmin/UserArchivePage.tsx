import { useEffect, useMemo, useState } from "react";
import { FolderKanban, RotateCcw, UserCircle2, Warehouse } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { usersApi, type User } from "../../lib/api/usersApi";
import { collectionsApi, type Collection } from "../../lib/api/collectionsApi";
import { rolesApi } from "../../lib/api/rolesApi";
import {
  hydrateBranchWarehouseData,
  persistWarehousesToBackend,
  saveWarehouses,
  type WarehouseRecord,
} from "../../lib/branchStorage";
import TabBar from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type ArchiveTab = "users" | "warehouses" | "collections";

export default function ArchivesPage() {
  const [activeTab, setActiveTab] = useState<ArchiveTab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<WarehouseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);

  const loadArchived = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, archivedCollections, branchWarehouseData] = await Promise.all([
        usersApi.listArchived(),
        collectionsApi.listArchived(),
        hydrateBranchWarehouseData(),
      ]);
      setUsers(userData);
      setCollections(archivedCollections);
      setAllWarehouses(branchWarehouseData.warehouses);
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
        || `${u.Fullname} ${u.Username} ${u.RoleName} ${u.BranchID}`
          .toLowerCase()
          .includes(needle);
      const matchesRole =
        roleFilter === "all" || u.RoleName.toLowerCase() === roleFilter.toLowerCase();
      return matchesQuery && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const filteredWarehouses = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return allWarehouses.filter((w) => {
      if (w.active === "Active") return false;
      const matchesQuery = !needle
        || `${w.name} ${w.address ?? ""}`.toLowerCase().includes(needle);
      const matchesType = warehouseTypeFilter === "all";
      return matchesQuery && matchesType;
    });
  }, [allWarehouses, searchQuery, warehouseTypeFilter]);

  const filteredCollections = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    return collections.filter((c) => {
      const matchesQuery = !needle
        || `${c.CollectionCode} ${c.CollectionName} ${c.Season}`
          .toLowerCase()
          .includes(needle);
      return matchesQuery;
    });
  }, [collections, searchQuery]);

  const restoreUser = async (id: number) => {
    setRestoringId(id);
    try {
      await usersApi.restore(id);
      setUsers((prev) => prev.filter((x) => x.UserID !== id));
    } finally {
      setRestoringId(null);
    }
  };

  const restoreWarehouse = async (id: number) => {
    setRestoringId(id);
    const target = allWarehouses.find((w) => w.id === id);
    if (!target) {
      setRestoringId(null);
      return;
    }
    try {
      const nextAllWarehouses = allWarehouses.map((w) =>
        w.id === id ? { ...w, active: "Active" as const } : w,
      );
      setAllWarehouses(nextAllWarehouses);
      saveWarehouses(nextAllWarehouses);
      await persistWarehousesToBackend(nextAllWarehouses);
    } finally {
      setRestoringId(null);
    }
  };

  const restoreCollection = async (id: number) => {
    setRestoringId(id);
    try {
      await collectionsApi.restore(id);
      setCollections((prev) => prev.filter((x) => x.CollectionID !== id));
    } finally {
      setRestoringId(null);
    }
  };

  const tabs = [
    { id: "users", label: "Users", icon: UserCircle2, count: filteredUsers.length },
    { id: "warehouses", label: "Warehouses", icon: Warehouse, count: filteredWarehouses.length },
    { id: "collections", label: "Collections", icon: FolderKanban, count: filteredCollections.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Archives</h1>
        <p className="mt-1 text-sm text-slate-500">
          Centralized archive center for soft-deleted records across account interfaces.
        </p>
      </div>

      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id as ArchiveTab);
          setSearchQuery("");
          setRoleFilter("all");
          setWarehouseTypeFilter("all");
          setIsFilterOpen(false);
        }}
      />

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
            placeholder={`Search archived ${activeTab}...`}
            inlineControls={
              <SecondaryButton onClick={() => void loadArchived()}>Refresh</SecondaryButton>
            }
          >
            <div className="space-y-2 p-3">
              {activeTab === "users" && (
                <>
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
                </>
              )}
              {activeTab === "warehouses" && (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Filter</p>
                  <Select value={warehouseTypeFilter} onValueChange={setWarehouseTypeFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Archived only" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Archived warehouses</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              {activeTab === "collections" && (
                <p className="text-[10px] text-slate-500">No additional filters for archived collections.</p>
              )}
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
                {activeTab === "users" ? (
                  <>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                  </>
                ) : activeTab === "collections" ? (
                  <>
                    <TableHead>Collection Code</TableHead>
                    <TableHead>Collection Name</TableHead>
                    <TableHead>Season</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Capacity</TableHead>
                  </>
                )}
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
              ) : activeTab === "users" && filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    No archived users found.
                  </TableCell>
                </TableRow>
              ) : activeTab === "warehouses" && filteredWarehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    No archived warehouses found.
                  </TableCell>
                </TableRow>
              ) : activeTab === "collections" && filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                    No archived collections found.
                  </TableCell>
                </TableRow>
              ) : activeTab === "users" ? (
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
                    <TableCell>{u.BranchID}</TableCell>
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
              ) : activeTab === "collections" ? (
                filteredCollections.map((c) => (
                  <TableRow key={c.CollectionID}>
                    <TableCell className="font-medium text-slate-800">{c.CollectionCode}</TableCell>
                    <TableCell>{c.CollectionName}</TableCell>
                    <TableCell>{c.Season}</TableCell>
                    <TableCell className="text-right">
                      <SecondaryButton
                        icon={RotateCcw}
                        onClick={() => void restoreCollection(c.CollectionID)}
                        disabled={restoringId === c.CollectionID}
                      >
                        {restoringId === c.CollectionID ? "Restoring..." : "Restore"}
                      </SecondaryButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                filteredWarehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium text-slate-800">{w.name}</TableCell>
                    <TableCell>{w.address || "-"}</TableCell>
                    <TableCell>{w.capacity}%</TableCell>
                    <TableCell className="text-right">
                      <SecondaryButton
                        icon={RotateCcw}
                        onClick={() => void restoreWarehouse(w.id)}
                        disabled={restoringId === w.id}
                      >
                        {restoringId === w.id ? "Restoring..." : "Restore"}
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
