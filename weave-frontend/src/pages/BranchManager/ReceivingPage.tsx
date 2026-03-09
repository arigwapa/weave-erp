import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  CheckCircle2,
  Eye,
  ListFilter,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import TabBar from "../../components/ui/TabBar";
import DetailsModal from "../../components/ui/DetailsModal";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

type ReceiveStatus = "Ready to Receive" | "Incoming" | "Received" | "Discrepancy Logged";

type ReceiveRecord = {
  id: string;
  transferRef: string;
  sku: string;
  qtyDispatched: number;
  eta: string;
  sourceWarehouse: string;
  status: ReceiveStatus;
  priority: "Critical" | "High" | "Medium";
  damagedUnits: number;
  missingUnits: number;
  note: string;
};

type ReceivingTab = "all" | "incoming" | "received" | "discrepancy";

const initialRecords: ReceiveRecord[] = [
  {
    id: "RCV-2603-001",
    transferRef: "TR-2026-118",
    sku: "SKU-JACKET-L-NAVY",
    qtyDispatched: 420,
    eta: "2026-03-03",
    sourceWarehouse: "WH-MNL-01",
    status: "Ready to Receive",
    priority: "High",
    damagedUnits: 0,
    missingUnits: 0,
    note: "",
  },
  {
    id: "RCV-2603-002",
    transferRef: "TR-2026-124",
    sku: "SKU-POLO-S-WHT",
    qtyDispatched: 280,
    eta: "2026-03-04",
    sourceWarehouse: "WH-CEB-01",
    status: "Incoming",
    priority: "Medium",
    damagedUnits: 0,
    missingUnits: 0,
    note: "",
  },
  {
    id: "RCV-2603-003",
    transferRef: "TR-2026-112",
    sku: "SKU-TSHIRT-M-BLK",
    qtyDispatched: 360,
    eta: "2026-03-02",
    sourceWarehouse: "WH-MNL-01",
    status: "Received",
    priority: "High",
    damagedUnits: 0,
    missingUnits: 0,
    note: "Received as dispatched.",
  },
  {
    id: "RCV-2603-004",
    transferRef: "TR-2026-107",
    sku: "SKU-DENIM-32-BLU",
    qtyDispatched: 300,
    eta: "2026-03-01",
    sourceWarehouse: "WH-DVO-02",
    status: "Discrepancy Logged",
    priority: "Critical",
    damagedUnits: 3,
    missingUnits: 2,
    note: "Packaging damage observed during unloading.",
  },
];

export default function ReceivingPage() {
  const [records, setRecords] = useState<ReceiveRecord[]>(initialRecords);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ReceivingTab>("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<ReceiveRecord | null>(null);
  const [modalMode, setModalMode] = useState<"details" | "receive">("details");
  const [receivedQty, setReceivedQty] = useState("");
  const [damagedUnits, setDamagedUnits] = useState("");
  const [missingUnits, setMissingUnits] = useState("");
  const [receiveNote, setReceiveNote] = useState("");

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return records.filter((item) => {
      const matchesTab =
        activeTab === "all"
          ? true
          : activeTab === "incoming"
            ? item.status === "Incoming" || item.status === "Ready to Receive"
            : activeTab === "received"
              ? item.status === "Received"
              : item.status === "Discrepancy Logged";
      const matchesQuery =
        query.length === 0 ||
        item.id.toLowerCase().includes(query) ||
        item.transferRef.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.sourceWarehouse.toLowerCase().includes(query);
      const matchesPriority = priorityFilter === "all" || item.priority.toLowerCase() === priorityFilter;
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter;
      return matchesTab && matchesQuery && matchesPriority && matchesStatus;
    });
  }, [records, activeTab, searchQuery, priorityFilter, statusFilter]);

  const tabs = useMemo(
    () => [
      { id: "all", label: "All", icon: ListFilter, count: records.length },
      {
        id: "incoming",
        label: "Incoming",
        icon: Truck,
        count: records.filter((item) => item.status === "Incoming" || item.status === "Ready to Receive").length,
      },
      {
        id: "received",
        label: "Received",
        icon: CheckCircle2,
        count: records.filter((item) => item.status === "Received").length,
      },
      {
        id: "discrepancy",
        label: "Discrepancy",
        icon: AlertTriangle,
        count: records.filter((item) => item.status === "Discrepancy Logged").length,
      },
    ],
    [records],
  );

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredRecords.length);
  const pagedRecords = filteredRecords.slice(startIndex, endIndex);

  const readyCount = filteredRecords.filter((item) => item.status === "Ready to Receive").length;
  const receivedCount = filteredRecords.filter((item) => item.status === "Received").length;
  const discrepancyCount = filteredRecords.filter((item) => item.status === "Discrepancy Logged").length;

  const openReceiveModal = (record: ReceiveRecord) => {
    setSelectedRecord(record);
    setModalMode("receive");
    setReceivedQty(String(record.qtyDispatched));
    setDamagedUnits(String(record.damagedUnits));
    setMissingUnits(String(record.missingUnits));
    setReceiveNote(record.note);
  };

  const openDetailsModal = (record: ReceiveRecord) => {
    setSelectedRecord(record);
    setModalMode("details");
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setReceivedQty("");
    setDamagedUnits("");
    setMissingUnits("");
    setReceiveNote("");
  };

  const confirmReceipt = () => {
    if (!selectedRecord) return;
    const damaged = Math.max(0, Number(damagedUnits) || 0);
    const missing = Math.max(0, Number(missingUnits) || 0);
    const nextStatus: ReceiveStatus = damaged + missing > 0 ? "Discrepancy Logged" : "Received";
    setRecords((prev) =>
      prev.map((item) =>
        item.id === selectedRecord.id
          ? {
              ...item,
              qtyDispatched: Number(receivedQty) || item.qtyDispatched,
              damagedUnits: damaged,
              missingUnits: missing,
              note: receiveNote.trim() || item.note,
              status: nextStatus,
            }
          : item,
      ),
    );
    closeModal();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
    setStatusFilter("all");
    setActiveTab("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Receiving</h1>
          <p className="mt-1 text-sm text-slate-500">
            Confirm incoming stock, capture discrepancy details, and update branch inventory after validation.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Receipt confirmation requires transfer reference, received quantity, and discrepancy note if damage or missing units exist.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Ready to Receive"
          value={String(readyCount)}
          icon={PackageCheck}
          colorTheme="indigo"
          trend="+2.1%"
          trendUp
          subText="Awaiting confirmation"
        />
        <DashboardStatsCard
          title="Received"
          value={String(receivedCount)}
          icon={Boxes}
          colorTheme="blue"
          trend="+4.0%"
          trendUp
          subText="Confirmed transfers"
        />
        <DashboardStatsCard
          title="Discrepancies"
          value={String(discrepancyCount)}
          icon={AlertTriangle}
          colorTheme="cyan"
          trend="-1.2%"
          trendUp={false}
          subText="Needs follow-up"
        />
        <DashboardStatsCard
          title="Visible Records"
          value={String(filteredRecords.length)}
          icon={Truck}
          colorTheme="emerald"
          trend="+1.8%"
          trendUp
          subText="Current filter scope"
        />
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Receiving Workbench</CardTitle>
          <CardDescription>Track transfer receipts and process receiving confirmation actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => {
                setActiveTab(id as ReceivingTab);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="px-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              placeholder="Search by receive ID, transfer ref, SKU, or warehouse..."
              filterLabel="Filter Receipts"
              inlineControls={<SecondaryButton onClick={resetFilters}>Reset</SecondaryButton>}
            >
              <div className="space-y-3 p-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Priority</p>
                  <Select
                    value={priorityFilter}
                    onValueChange={(value) => {
                      setPriorityFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="ready to receive">Ready to Receive</SelectItem>
                      <SelectItem value="incoming">Incoming</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="discrepancy logged">Discrepancy Logged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Receive ID</TableHead>
                <TableHead>Transfer Ref</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Dispatched Qty</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    No receiving records found for selected search/filter.
                  </TableCell>
                </TableRow>
              ) : (
                pagedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{record.id}</p>
                      <p className="text-xs text-slate-500">{record.priority}</p>
                    </TableCell>
                    <TableCell>{record.transferRef}</TableCell>
                    <TableCell>{record.sku}</TableCell>
                    <TableCell>{record.qtyDispatched}</TableCell>
                    <TableCell>{record.sourceWarehouse}</TableCell>
                    <TableCell>{record.eta}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status} />
                    </TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton
                          icon={Eye}
                          className="!rounded-lg !px-2 !py-2"
                          onClick={() => openDetailsModal(record)}
                        >
                          <span className="sr-only">Details</span>
                        </SecondaryButton>
                        <PrimaryButton
                          onClick={() => openReceiveModal(record)}
                          className="!w-auto !rounded-full !px-4 !py-2 !text-xs"
                          disabled={record.status === "Received"}
                        >
                          Confirm Receipt
                        </PrimaryButton>
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
            totalItems={filteredRecords.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedRecord !== null}
        onClose={closeModal}
        title={modalMode === "receive" ? "Receipt Confirmation" : "Receiving Details"}
        itemId={selectedRecord?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            {modalMode === "receive" ? <PackageCheck size={16} /> : <Boxes size={16} />}
          </div>
        }
        gridFields={
          selectedRecord
            ? [
                { label: "Transfer Reference", value: selectedRecord.transferRef, icon: Truck },
                { label: "SKU", value: selectedRecord.sku, icon: Boxes },
                { label: "Source Warehouse", value: selectedRecord.sourceWarehouse, icon: Truck },
                { label: "Status", value: selectedRecord.status, icon: ShieldCheck },
                { label: "Priority", value: selectedRecord.priority, icon: AlertTriangle },
                { label: "ETA", value: selectedRecord.eta, icon: CalendarClock },
              ]
            : []
        }
        footerActions={
          modalMode === "receive" ? (
            <>
              <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
              <PrimaryButton
                onClick={confirmReceipt}
                className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              >
                Save Receipt
              </PrimaryButton>
            </>
          ) : undefined
        }
      >
        {modalMode === "receive" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Received Quantity</Label>
              <Input
                type="number"
                min={0}
                value={receivedQty}
                onChange={(event) => setReceivedQty(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expected Quantity</Label>
              <Input value={String(selectedRecord?.qtyDispatched ?? 0)} disabled />
            </div>
            <div className="space-y-2">
              <Label>Damaged Units</Label>
              <Input
                type="number"
                min={0}
                value={damagedUnits}
                onChange={(event) => setDamagedUnits(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Missing Units</Label>
              <Input
                type="number"
                min={0}
                value={missingUnits}
                onChange={(event) => setMissingUnits(event.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Discrepancy Note</Label>
              <Textarea
                value={receiveNote}
                onChange={(event) => setReceiveNote(event.target.value)}
                placeholder="Add details for any damaged or missing units."
              />
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-700 sm:col-span-2">
              Auto-update: branch stock levels are updated after receipt confirmation is finalized.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Discrepancy Summary</p>
              <p className="mt-1 text-sm text-slate-700">
                Damaged: {selectedRecord?.damagedUnits ?? 0}, Missing: {selectedRecord?.missingUnits ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Note</p>
              <p className="mt-1 text-sm text-slate-700">{selectedRecord?.note || "No notes captured."}</p>
            </div>
          </div>
        )}
      </DetailsModal>
    </div>
  );
}
