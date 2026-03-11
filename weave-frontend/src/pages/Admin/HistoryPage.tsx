import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import TabBar from "../../components/ui/TabBar";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import { adminApprovalInboxApi, type AdminApprovalFinanceItem } from "../../lib/api/adminApprovalInboxApi";
import { inspectionApi, type InspectionHistoryItem } from "../../lib/api/inspectionApi";
import { StatusBadge } from "../../components/ui/StatusBadge";

type HistoryTab = "product" | "qa";

function formatDateTime(value?: string): string {
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
}

export default function AdminHistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [productRows, setProductRows] = useState<AdminApprovalFinanceItem[]>([]);
  const [qaRows, setQaRows] = useState<InspectionHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [finance, qaHistory] = await Promise.all([
          adminApprovalInboxApi.listFinance(),
          inspectionApi.listHistory(),
        ]);
        const approvedFinance = (finance ?? []).filter(
          (item) => item.Status.trim().toLowerCase() === "approved",
        );
        const approvedQa = (qaHistory ?? []).filter(
          (item) => (item.Result ?? "").trim().toLowerCase() === "accepted",
        );
        setProductRows(approvedFinance);
        setQaRows(approvedQa);
      } catch {
        setProductRows([]);
        setQaRows([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const tabs = useMemo(
    () => [
      { id: "product", label: "Product", icon: CheckCircle2, count: productRows.length },
      { id: "qa", label: "Quality Assurance", icon: ClipboardCheck, count: qaRows.length },
    ],
    [productRows.length, qaRows.length],
  );

  const filteredProductRows = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return productRows;
    return productRows.filter((item) =>
      `${item.CollectionName} ${item.CollectionCode} ${item.SubmittedBy} ${item.Status}`
        .toLowerCase()
        .includes(needle),
    );
  }, [productRows, searchQuery]);

  const filteredQaRows = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return qaRows;
    return qaRows.filter((item) =>
      `${item.InspectionID} ${item.BatchBoardID} ${item.BatchCode} ${item.InspectorName} ${item.VersionNumber} ${item.ProductName} ${item.Result}`
        .toLowerCase()
        .includes(needle),
    );
  }, [qaRows, searchQuery]);

  const sourceRows = activeTab === "product" ? filteredProductRows : filteredQaRows;
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(sourceRows.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sourceRows.length);
  const pagedRows = sourceRows.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">History</h1>
        <p className="mt-1 text-sm text-slate-500">Central record of approved product and QA decisions.</p>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardContent className="p-6">
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => {
              setActiveTab(id as HistoryTab);
              setCurrentPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Approved Records</CardTitle>
          <CardDescription>
            {activeTab === "product"
              ? "Approved product decisions."
              : "Approved quality assurance inspection outcomes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              placeholder="Search records..."
              filterLabel="History Filter"
            >
              <div className="p-3 text-xs text-slate-500">
                Showing approved records only.
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              {activeTab === "product" ? (
                <TableRow>
                  <TableHead className="px-6">Collection</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Total BOM Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              ) : (
                <TableRow>
                  <TableHead className="px-6">Inspection ID</TableHead>
                  <TableHead>BatchBoard ID</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Sender User</TableHead>
                  <TableHead>Product Version</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              )}
            </TableHeader>
            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "product" ? 5 : 7} className="px-6 py-10 text-center text-sm text-slate-500">
                    {isLoading ? "Loading history..." : "No approved records found."}
                  </TableCell>
                </TableRow>
              ) : activeTab === "product" ? (
                (pagedRows as AdminApprovalFinanceItem[]).map((item) => (
                  <TableRow key={`${item.CollectionID}-${item.PackageID}`}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{item.CollectionName}</p>
                      <p className="text-xs text-slate-500">{item.CollectionCode}</p>
                    </TableCell>
                    <TableCell>{item.SubmittedBy}</TableCell>
                    <TableCell>{formatDateTime(item.SubmittedAt)}</TableCell>
                    <TableCell>PHP {item.TotalBomCost.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={item.Status} /></TableCell>
                  </TableRow>
                ))
              ) : (
                (pagedRows as InspectionHistoryItem[]).map((item) => (
                  <TableRow key={item.InspectionID}>
                    <TableCell className="px-6">{item.InspectionID}</TableCell>
                    <TableCell>{item.BatchBoardID}</TableCell>
                    <TableCell>{item.BatchCode}</TableCell>
                    <TableCell>{item.InspectorName || `User #${item.UserID}`}</TableCell>
                    <TableCell>{item.VersionNumber}</TableCell>
                    <TableCell>{item.ProductName}</TableCell>
                    <TableCell><StatusBadge status={item.Result} /></TableCell>
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
            totalItems={sourceRows.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
