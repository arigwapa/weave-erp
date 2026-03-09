import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import Pagination from "../../components/ui/Pagination";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
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
import { TableToolbar } from "../../components/ui/TableToolbar";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import { Badge } from "../../components/ui/badge";
import {
  type WarehouseRecord,
  hydrateBranchWarehouseData,
  loadWarehouses,
  persistWarehousesToBackend,
  saveWarehouses,
} from "../../lib/branchStorage";

type WarehouseDraft = {
  name: string;
  address: string;
  capacity: string;
  isActive: boolean;
};

const EMPTY_WAREHOUSE_DRAFT: WarehouseDraft = {
  name: "",
  address: "",
  capacity: "",
  isActive: true,
};

function AddWarehouseModal({
  isOpen,
  onClose,
  onSave,
  draft,
  setDraft,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  draft: WarehouseDraft;
  setDraft: React.Dispatch<React.SetStateAction<WarehouseDraft>>;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Add Warehouse</h3>
          <p className="mt-1 text-xs text-slate-500">
            Create warehouse and make it available for warehouse manager assignment.
          </p>
        </div>
        <div className="p-6 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Warehouse Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter warehouse name"
              className="rounded-2xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input
              value={draft.address}
              onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Enter warehouse address"
              className="rounded-2xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Capacity %</Label>
            <Input
              value={draft.capacity}
              onChange={(e) => setDraft((prev) => ({ ...prev, capacity: e.target.value }))}
              placeholder="0 - 100"
              className="rounded-2xl"
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Status</Label>
            <div className="flex items-center gap-3">
              <ToggleSwitch
                active={draft.isActive}
                onToggle={() => setDraft((prev) => ({ ...prev, isActive: !prev.isActive }))}
                label="Set warehouse active status"
              />
              <span className="text-sm text-slate-600">{draft.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <SecondaryButton
            onClick={onSave}
            className="!bg-slate-900 !text-white !border-slate-900 hover:!bg-slate-800 hover:!text-white"
          >
            Add Warehouse
          </SecondaryButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function BranchWarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>(() => loadWarehouses());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [warehouseDraft, setWarehouseDraft] = useState<WarehouseDraft>(EMPTY_WAREHOUSE_DRAFT);
  const itemsPerPage = 4;

  useEffect(() => {
    hydrateBranchWarehouseData()
      .then(({ warehouses: hydratedWarehouses }) => setWarehouses(hydratedWarehouses))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    saveWarehouses(warehouses);
    void persistWarehousesToBackend(warehouses);
  }, [warehouses]);

  const filteredWarehouses = useMemo(
    () =>
      warehouses.filter((warehouse) => {
        const matchesSearch =
          warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (warehouse.address ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || warehouse.active === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [warehouses, searchQuery, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredWarehouses.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredWarehouses.length);
  const paginatedRows = filteredWarehouses.slice(startIndex, endIndex);

  const saveWarehouse = () => {
    const name = warehouseDraft.name.trim();
    const address = warehouseDraft.address.trim();
    const capacity = Number(warehouseDraft.capacity);
    if (!name || Number.isNaN(capacity)) return;

    const nextId = Math.max(...warehouses.map((w) => w.id), 0) + 1;
    setWarehouses((prev) => [
      {
        id: nextId,
        name,
        address,
        capacity: Math.max(0, Math.min(100, capacity)),
        active: warehouseDraft.isActive ? "Active" : "Inactive",
      },
      ...prev,
    ]);
    setWarehouseDraft(EMPTY_WAREHOUSE_DRAFT);
    setCurrentPage(1);
    setIsWarehouseModalOpen(false);
  };

  const toggleWarehouseStatus = (id: number) => {
    setWarehouses((prev) =>
      prev.map((warehouse) =>
        warehouse.id === id
          ? { ...warehouse, active: warehouse.active === "Active" ? "Inactive" : "Active" }
          : warehouse
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Warehouse Management</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage warehouse records and availability across the organization.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Warehouse List</CardTitle>
          <CardDescription>
            Manage warehouse records available for warehouse manager assignment and operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              onAdd={() => setIsWarehouseModalOpen(true)}
              addLabel="Add Warehouse"
              filterLabel="Status"
              placeholder="Search warehouse name/address..."
            >
              <div className="p-3 space-y-3">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Warehouse</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Warehouse Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    No records found for current filters.
                  </TableCell>
                </TableRow>
              ) : (
                (paginatedRows as WarehouseRecord[]).map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="px-6 font-medium text-slate-800">{warehouse.name}</TableCell>
                    <TableCell>{warehouse.address || "-"}</TableCell>
                    <TableCell>{warehouse.capacity}%</TableCell>
                    <TableCell>
                      {warehouse.warehouseManagerName?.trim() ? (
                        <Badge variant="secondary">{warehouse.warehouseManagerName}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={warehouse.active} />
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end">
                        <ToggleSwitch
                          active={warehouse.active === "Active"}
                          onToggle={() => toggleWarehouseStatus(warehouse.id)}
                          label={`Toggle ${warehouse.name} status`}
                        />
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
            totalItems={filteredWarehouses.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <AddWarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        onSave={saveWarehouse}
        draft={warehouseDraft}
        setDraft={setWarehouseDraft}
      />
    </div>
  );
}
