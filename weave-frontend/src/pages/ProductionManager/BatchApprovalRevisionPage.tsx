import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import { adminApprovalInboxApi, type AdminApprovalQaItem } from "../../lib/api/adminApprovalInboxApi";

const bumpVersionNumber = (value: string): string => {
  const raw = (value ?? "").trim();
  if (!raw) return "Version 2";
  const match = raw.match(/(\d+)(?!.*\d)/);
  if (!match) return `${raw} Rev 1`;
  const current = Number(match[1]);
  if (!Number.isFinite(current)) return `${raw} Rev 1`;
  return raw.replace(/(\d+)(?!.*\d)/, String(current + 1));
};

const computeDisplayVersion = (row: AdminApprovalQaItem): string => {
  const baseVersion = row.ProductVersion || "Version 1";
  return row.Result.toLowerCase() === "fail" ? bumpVersionNumber(baseVersion) : baseVersion;
};

export default function BatchApprovalRevisionPage() {
  const [records, setRecords] = useState<AdminApprovalQaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [submittingInspectionId, setSubmittingInspectionId] = useState<number | null>(null);

  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true);
      try {
        const data = await adminApprovalInboxApi.listQaForProductionReview();
        setRecords(data);
      } catch {
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    void loadQueue();
  }, []);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        record.BatchNumber.toLowerCase().includes(q) ||
        record.ProductName.toLowerCase().includes(q) ||
        record.ProductVersion.toLowerCase().includes(q) ||
        record.SenderName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || record.Status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const statuses = Array.from(
    new Set(filteredRecords.map((record) => record.Status?.trim()).filter(Boolean)),
  ) as string[];

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const sendToProductionQueue = async (inspectionId: number) => {
    setSubmittingInspectionId(inspectionId);
    try {
      await adminApprovalInboxApi.sendQaToProductionQueue(inspectionId);
      setRecords((prev) => prev.filter((item) => item.InspectionID !== inspectionId));
    } finally {
      setSubmittingInspectionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Batch Approval & Revision</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review QA failures submitted by Admin and send them to production queue.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">QA Decision Queue</CardTitle>
          <CardDescription>Records submitted from Admin Approval Inbox for production processing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Status Filter"
              placeholder="Search batch, product, version, sender..."
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
                    {statuses.map((status) => (
                      <SelectItem key={status.toLowerCase()} value={status.toLowerCase()}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Inspection ID</TableHead>
                <TableHead>BatchBoard ID</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Sender User</TableHead>
                <TableHead>Product Version</TableHead>
                <TableHead>Version Number</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="pl-6 text-left">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading approval revision queue..." : "No records awaiting production queue."}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.InspectionID}>
                    <TableCell className="px-6">{record.InspectionID}</TableCell>
                    <TableCell>{record.BatchBoardID}</TableCell>
                    <TableCell>{record.BatchNumber}</TableCell>
                    <TableCell>{record.SenderName || "-"}</TableCell>
                    <TableCell>{record.ProductVersion || "-"}</TableCell>
                    <TableCell>{computeDisplayVersion(record)}</TableCell>
                    <TableCell>{record.ProductName || "-"}</TableCell>
                    <TableCell><StatusBadge status={record.Result} /></TableCell>
                    <TableCell className="pl-6">
                      <PrimaryButton
                        className="!w-auto !rounded-full !px-4 !py-2 !text-[11px]"
                        isLoading={submittingInspectionId === record.InspectionID}
                        onClick={() => void sendToProductionQueue(record.InspectionID)}
                      >
                        Send to production queue
                      </PrimaryButton>
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
    </div>
  );
}
