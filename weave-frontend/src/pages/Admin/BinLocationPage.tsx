import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, PackageCheck, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import TabBar from "../../components/ui/TabBar";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { binLocationApi, type BinLocation } from "../../lib/api/binLocationApi";

type TabId = "active" | "archived";

const initialForm = {
  binCode: "",
};

export default function BinLocationPage() {
  const [activeRows, setActiveRows] = useState<BinLocation[]>([]);
  const [archivedRows, setArchivedRows] = useState<BinLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BinLocation | null>(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [active, archived] = await Promise.all([
        binLocationApi.list(),
        binLocationApi.listArchived(),
      ]);
      setActiveRows(active);
      setArchivedRows(archived);
    } catch {
      setActiveRows([]);
      setArchivedRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const sourceRows = activeTab === "active" ? activeRows : archivedRows;
  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sourceRows;
    return sourceRows.filter((row) =>
      String(row.BinLocation || row.BinCode).toLowerCase().includes(q),
    );
  }, [sourceRows, searchQuery]);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRows.length);
  const pagedRows = filteredRows.slice(startIndex, endIndex);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEdit = (row: BinLocation) => {
    setEditing(row);
    setForm({
      binCode: row.BinLocation || row.BinCode,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const save = async () => {
    const binCode = form.binCode.trim();
    if (!binCode) return setFormError("Bin code is required.");

    setIsSaving(true);
    setFormError("");
    try {
      if (editing) {
        await binLocationApi.update(editing.BinID, {
          BinLocation: binCode,
        });
      } else {
        await binLocationApi.create({
          BinLocation: binCode,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save bin location.");
    } finally {
      setIsSaving(false);
    }
  };

  const archive = async (id: number) => {
    try {
      await binLocationApi.archive(id);
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to archive bin location.");
    }
  };

  const restore = async (id: number) => {
    try {
      await binLocationApi.restore(id);
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to restore bin location.");
    }
  };

  const tabs = [
    { id: "active", label: "Active Bins", icon: PackageCheck, count: activeRows.length },
    { id: "archived", label: "Archived Bins", icon: Archive, count: archivedRows.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bin Location</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit, archive, and monitor occupancy of warehouse bin locations.
          </p>
        </div>
        <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-xs" onClick={openCreate}>
          Create Bin Location
        </PrimaryButton>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardContent className="p-6">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => {
              setActiveTab(id as TabId);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Bin Location Table</CardTitle>
          <CardDescription>Shows availability and occupied status for each bin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Filter"
              placeholder="Search bin location..."
              inlineControls={
                <SecondaryButton
                  icon={RotateCcw}
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Bin Location</TableHead>
                <TableHead>IsBinActive</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>CreatedAt</TableHead>
                <TableHead>UpdatedAt</TableHead>
                <TableHead className="text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading bin locations..." : "No bin locations found."}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow key={row.BinID}>
                    <TableCell>{row.BinLocation || row.BinCode}</TableCell>
                    <TableCell><StatusBadge status={row.IsBinActive ? "Active" : "Archived"} /></TableCell>
                    <TableCell><StatusBadge status={row.OccupancyStatus} /></TableCell>
                    <TableCell>{formatDateTime(row.CreatedAt)}</TableCell>
                    <TableCell>{formatDateTime(row.UpdatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {activeTab === "active" ? (
                          <>
                            <SecondaryButton
                              className="!w-auto !rounded-full !px-3 !py-1 !text-[11px]"
                              onClick={() => openEdit(row)}
                            >
                              Edit
                            </SecondaryButton>
                            <SecondaryButton
                              className="!w-auto !rounded-full !px-3 !py-1 !text-[11px]"
                              onClick={() => void archive(row.BinID)}
                            >
                              Archive
                            </SecondaryButton>
                          </>
                        ) : (
                          <SecondaryButton
                            className="!w-auto !rounded-full !px-3 !py-1 !text-[11px]"
                            onClick={() => void restore(row.BinID)}
                          >
                            Restore
                          </SecondaryButton>
                        )}
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
            totalItems={filteredRows.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      {isModalOpen
        ? createPortal(
            <div className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]">
              <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
                <h3 className="text-base font-semibold text-slate-900">{editing ? "Edit Bin Location" : "Create Bin Location"}</h3>
                <div className="mt-4 grid gap-3">
                  <div className="space-y-1">
                    <Label>Bin Location</Label>
                    <Input value={form.binCode} onChange={(e) => setForm((p) => ({ ...p, binCode: e.target.value }))} />
                  </div>
                </div>
                {formError ? <p className="mt-3 text-xs text-rose-600">{formError}</p> : null}
                <div className="mt-4 flex justify-end gap-2">
                  <SecondaryButton onClick={() => setIsModalOpen(false)}>Cancel</SecondaryButton>
                  <PrimaryButton isLoading={isSaving} className="!w-auto !rounded-full !px-4 !py-2 !text-xs" onClick={() => void save()}>
                    Submit
                  </PrimaryButton>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
