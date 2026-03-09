import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Boxes, CheckCircle2, ListFilter, RotateCcw, Send, TimerReset } from "lucide-react";
import DashboardStatsCard from "../../components/ui/DashboardStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import TabBar from "../../components/ui/TabBar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
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
import { useAuth } from "../../lib/AuthContext";
import {
  createRestockRequestId,
  persistRestockRequestsToBackend,
  loadRestockRequests,
  saveRestockRequests,
  type RestockPriority,
} from "../../lib/restockRequestStorage";

const stocks = [
  {
    sku: "SKU-TSHIRT-M-BLK",
    category: "Tops",
    size: "M",
    onHand: 45,
    reserved: 12,
    reorderLevel: 30,
    daysCover: 4,
    movementSpeed: "Fast",
  },
  {
    sku: "SKU-JACKET-L-NAVY",
    category: "Outerwear",
    size: "L",
    onHand: 18,
    reserved: 6,
    reorderLevel: 20,
    daysCover: 3,
    movementSpeed: "Medium",
  },
  {
    sku: "SKU-DENIM-32-BLU",
    category: "Bottoms",
    size: "32",
    onHand: 61,
    reserved: 15,
    reorderLevel: 40,
    daysCover: 9,
    movementSpeed: "Fast",
  },
  {
    sku: "SKU-POLO-S-WHT",
    category: "Tops",
    size: "S",
    onHand: 14,
    reserved: 5,
    reorderLevel: 22,
    daysCover: 2,
    movementSpeed: "Slow",
  },
  {
    sku: "SKU-HOODIE-XL-GRY",
    category: "Outerwear",
    size: "XL",
    onHand: 26,
    reserved: 11,
    reorderLevel: 24,
    daysCover: 3,
    movementSpeed: "Medium",
  },
  {
    sku: "SKU-CHINO-30-KHK",
    category: "Bottoms",
    size: "30",
    onHand: 72,
    reserved: 10,
    reorderLevel: 38,
    daysCover: 11,
    movementSpeed: "Fast",
  },
  {
    sku: "SKU-SHIRT-L-SKY",
    category: "Tops",
    size: "L",
    onHand: 19,
    reserved: 7,
    reorderLevel: 20,
    daysCover: 3,
    movementSpeed: "Slow",
  },
];

const getStockStatus = (onHand: number, reorderLevel: number) => {
  if (onHand <= reorderLevel * 0.5) return "Critical";
  if (onHand <= reorderLevel) return "Low";
  if (onHand >= reorderLevel * 1.6) return "Excess";
  return "Healthy";
};

type InventoryTab = "all" | "healthy" | "low";
type StockRow = (typeof stocks)[number] & { stockStatus: string };

export default function InventoryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InventoryTab>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [movementFilter, setMovementFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockRow | null>(null);
  const [requestedQty, setRequestedQty] = useState("");
  const [requestPriority, setRequestPriority] = useState<RestockPriority>("High");
  const [requestNote, setRequestNote] = useState("");

  const mappedStocks = useMemo(
    () =>
      stocks.map((item) => ({
        ...item,
        stockStatus: getStockStatus(item.onHand, item.reorderLevel),
      })),
    [],
  );

  const filteredStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mappedStocks.filter((item) => {
      const matchTab =
        activeTab === "all"
          ? true
          : activeTab === "healthy"
            ? item.stockStatus === "Healthy"
            : item.stockStatus === "Low";
      const matchQuery =
        query.length === 0 ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.size.toLowerCase().includes(query);
      const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchSize = sizeFilter === "all" || item.size === sizeFilter;
      const matchStatus = stockStatusFilter === "all" || item.stockStatus === stockStatusFilter;
      const matchMovement = movementFilter === "all" || item.movementSpeed === movementFilter;
      return matchTab && matchQuery && matchCategory && matchSize && matchStatus && matchMovement;
    });
  }, [mappedStocks, activeTab, searchQuery, categoryFilter, sizeFilter, stockStatusFilter, movementFilter]);

  const itemsPerPage = 5;
  const totalItems = filteredStocks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  const kpis = useMemo(() => {
    const lowOrCritical = mappedStocks.filter(
      (item) => item.stockStatus === "Low" || item.stockStatus === "Critical",
    ).length;
    const totalReserved = mappedStocks.reduce((sum, item) => sum + item.reserved, 0);
    const avgDaysCover = mappedStocks.reduce((sum, item) => sum + item.daysCover, 0) / mappedStocks.length;
    const fastMoving = mappedStocks.filter((item) => item.movementSpeed === "Fast").length;
    return { lowOrCritical, totalReserved, avgDaysCover, fastMoving };
  }, [mappedStocks]);

  const resetFilters = () => {
    setCategoryFilter("all");
    setSizeFilter("all");
    setStockStatusFilter("all");
    setMovementFilter("all");
    setSearchQuery("");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const tabs = useMemo(
    () => [
      { id: "all", label: "All", icon: ListFilter, count: mappedStocks.length },
      {
        id: "healthy",
        label: "Healthy",
        icon: CheckCircle2,
        count: mappedStocks.filter((item) => item.stockStatus === "Healthy").length,
      },
      {
        id: "low",
        label: "Low",
        icon: AlertTriangle,
        count: mappedStocks.filter((item) => item.stockStatus === "Low").length,
      },
    ],
    [mappedStocks],
  );

  const openRequestModal = (row: StockRow) => {
    const suggestedQty = Math.max(row.reorderLevel + row.reserved - row.onHand, 1);
    setSelectedStock(row);
    setRequestedQty(String(suggestedQty));
    setRequestPriority(row.stockStatus === "Low" ? "High" : "Critical");
    setRequestNote(`Restock requested for ${row.sku} (${row.size}) to recover target cover.`);
    setRequestError("");
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setSelectedStock(null);
    setRequestError("");
    setRequestedQty("");
    setRequestPriority("High");
    setRequestNote("");
  };

  const submitRestockRequest = () => {
    if (!selectedStock) return;
    const qty = Number(requestedQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setRequestError("Requested quantity should be greater than 0.");
      return;
    }

    const existing = loadRestockRequests();
    const hasDuplicate = existing.some(
      (entry) =>
        entry.sku === selectedStock.sku &&
        entry.size === selectedStock.size &&
        (entry.status === "Pending" || entry.status === "In Review"),
    );
    if (hasDuplicate) {
      setRequestError("An active request already exists for this SKU and size.");
      return;
    }

    const now = new Date();
    const requestedAt = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const next = [
      {
        id: createRestockRequestId(existing),
        sku: selectedStock.sku,
        category: selectedStock.category,
        size: selectedStock.size,
        requestedQty: qty,
        priority: requestPriority,
        note: requestNote.trim() || "Restock requested from inventory low-level trigger.",
        requestedAt,
        requestedBy: user?.fullname || user?.username || "Branch Manager",
        branchName: user?.branchName || "Manila Central",
        onHand: selectedStock.onHand,
        reorderLevel: selectedStock.reorderLevel,
        status: "Pending" as const,
        targetRole: "Admin" as const,
      },
      ...existing,
    ];
    saveRestockRequests(next);
    // BACKEND-TRACK: mirror request submission to backend.
    void persistRestockRequestsToBackend(next);
    closeRequestModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Branch Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Product-size stock visibility with reorder and cover metrics for replenishment decisions.
          </p>
        </div>
        <StatusBadge status="Operational" />
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Prioritize replenishment for SKUs below reorder level and confirm reserve allocation before dispatch.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatsCard
          title="Low/Critical SKUs"
          value={String(kpis.lowOrCritical)}
          icon={AlertTriangle}
          colorTheme="indigo"
          trend="+3.1%"
          trendUp
          subText="Needs replenishment"
        />
        <DashboardStatsCard
          title="Reserved Units"
          value={String(kpis.totalReserved)}
          icon={Boxes}
          colorTheme="blue"
          trend="+2.4%"
          trendUp
          subText="Committed demand"
        />
        <DashboardStatsCard
          title="Avg Days of Cover"
          value={kpis.avgDaysCover.toFixed(1)}
          icon={TimerReset}
          colorTheme="emerald"
          trend="-0.6%"
          trendUp={false}
          subText="Across visible SKUs"
        />
        <DashboardStatsCard
          title="Fast Moving SKUs"
          value={String(kpis.fastMoving)}
          icon={RotateCcw}
          colorTheme="cyan"
          trend="+4.2%"
          trendUp
          subText="High movement rate"
        />
      </section>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Product-Size Stock Table</CardTitle>
          <CardDescription>
            Track on-hand, reserved, reorder level, days of cover, movement speed, and stock status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(id) => {
                setActiveTab(id as InventoryTab);
                setCurrentPage(1);
              }}
            />
          </div>

          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            placeholder="Search SKU, category, or size..."
            filterLabel="Filter Inventory"
          >
            <div className="space-y-3 p-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Category</p>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Tops">Tops</SelectItem>
                    <SelectItem value="Outerwear">Outerwear</SelectItem>
                    <SelectItem value="Bottoms">Bottoms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Size</p>
                <Select value={sizeFilter} onValueChange={setSizeFilter}>
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Stock Status</p>
                <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="Excess">Excess</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Movement Speed</p>
                <Select value={movementFilter} onValueChange={setMovementFilter}>
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Speed</SelectItem>
                    <SelectItem value="Fast">Fast</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Slow">Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </TableToolbar>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>On-Hand</TableHead>
                <TableHead>Reserved</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Days of Cover</TableHead>
                <TableHead>Movement Speed</TableHead>
                <TableHead className="pr-2 text-right">Stock Status</TableHead>
                {activeTab === "low" && <TableHead className="pl-6 text-left">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStocks.length > 0 ? (
                paginatedStocks.map((row) => (
                  <TableRow key={row.sku + row.size}>
                    <TableCell className="font-medium text-slate-800">{row.sku}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell>{row.onHand}</TableCell>
                    <TableCell>{row.reserved}</TableCell>
                    <TableCell>{row.reorderLevel}</TableCell>
                    <TableCell>{row.daysCover}</TableCell>
                    <TableCell>{row.movementSpeed}</TableCell>
                    <TableCell className="pr-2 text-right">
                      <StatusBadge status={row.stockStatus} />
                    </TableCell>
                    {activeTab === "low" && (
                      <TableCell className="pl-6">
                        <PrimaryButton
                          onClick={() => openRequestModal(row)}
                          className="!w-auto !rounded-full !px-4 !py-2 !text-xs"
                        >
                          <Send size={14} />
                          Request Restock
                        </PrimaryButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={activeTab === "low" ? 10 : 9} className="py-8 text-center text-sm text-slate-500">
                    No inventory records match your current search/filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </Card>

      {isRequestModalOpen &&
        selectedStock &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                <h3 className="text-base font-bold text-slate-800">Restock Request Form</h3>
                <p className="text-xs text-slate-500">This request will be routed to Admin for restock workflow review.</p>
              </div>
              <div className="grid gap-4 overflow-y-auto p-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={selectedStock.sku} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={selectedStock.category} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Input value={selectedStock.size} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Requested Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    value={requestedQty}
                    onChange={(event) => setRequestedQty(event.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={requestPriority} onValueChange={(value) => setRequestPriority(value as RestockPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current On-Hand</Label>
                  <Input value={String(selectedStock.onHand)} disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Reason / Note</Label>
                  <Textarea
                    value={requestNote}
                    onChange={(event) => setRequestNote(event.target.value)}
                    placeholder="Add restock context and urgency details."
                  />
                </div>
                {requestError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 sm:col-span-2">
                    {requestError}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
                <SecondaryButton onClick={closeRequestModal}>Cancel</SecondaryButton>
                <PrimaryButton onClick={submitRestockRequest} className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
                  Submit to Admin
                </PrimaryButton>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
