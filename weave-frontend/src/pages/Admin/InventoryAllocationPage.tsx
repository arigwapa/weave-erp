import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Input } from "../../components/ui/input";
import { productionInventoryApi, type WarehouseInventoryRow } from "../../lib/api/productionInventoryApi";

const DEFAULT_RELEASE_TAG = "Official Version";

export default function InventoryAllocationPage() {
  const [records, setRecords] = useState<WarehouseInventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadInventories = async () => {
      setIsLoading(true);
      try {
        const rows = await productionInventoryApi.listWarehouseTable();
        setRecords(rows);
      } catch {
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadInventories();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        String(record.VersionID).includes(q) ||
        String(record.BinLocation || "").toLowerCase().includes(q) ||
        String(record.ProductID ?? "").includes(q) ||
                (record.CollectionName ?? "").toLowerCase().includes(q) ||
        (record.Status ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || record.Status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Warehouse Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track production inventory with version, bin assignment, quantity, release tag, and source metadata.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Warehouse Inventory Table</CardTitle>
          <CardDescription>
            Columns: VersionID, Bin Location (input), CollectionName, QuantityOnHand, Status, ReleaseTag, SourceInspectionID, BatchBoardID, ProductID, ReceivedAt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Status Filter"
              placeholder="Search version, bin location, product, status..."
              inlineControls={
                <SecondaryButton
                  icon={RotateCcw}
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
                <select
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="low stock">Low Stock</option>
                  <option value="in production">In Production</option>
                  <option value="replenishment requested">Replenishment Requested</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">VersionID</TableHead>
                <TableHead>Bin Location (input)</TableHead>
                <TableHead>CollectionName</TableHead>
                <TableHead>QuantityOnHand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ReleaseTag</TableHead>
                <TableHead>SourceInspectionID</TableHead>
                <TableHead>BatchBoardID</TableHead>
                <TableHead>ProductID</TableHead>
                <TableHead>ReceivedAt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading warehouse inventory..." : "No inventory records found."}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.ProdInvID}>
                    <TableCell className="px-6">{record.VersionID}</TableCell>
                    <TableCell>
                      <Input
                        value={record.BinLocation ?? String(record.BinID)}
                        readOnly
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>{record.CollectionName || "-"}</TableCell>
                    <TableCell>{record.QuantityOnHand}</TableCell>
                    <TableCell>{record.Status}</TableCell>
                    <TableCell>{record.ReleaseTag || DEFAULT_RELEASE_TAG}</TableCell>
                    <TableCell>{record.SourceInspectionID ?? "-"}</TableCell>
                    <TableCell>{record.BatchBoardID ?? "-"}</TableCell>
                    <TableCell>{record.ProductID ?? "-"}</TableCell>
                    <TableCell>{record.ReceivedAt ?? "-"}</TableCell>
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
    </div>
  );
}
