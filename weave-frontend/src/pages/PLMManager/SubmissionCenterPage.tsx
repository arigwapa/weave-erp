import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Send, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableToolbar } from "../../components/ui/TableToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { collectionsApi, type Collection } from "../../lib/api/collectionsApi";
import { productsApi, type Product } from "../../lib/api/productsApi";
import { bomApi, type BomLine } from "../../lib/api/bomApi";
import { financeBudgetPlannerApi } from "../../lib/api/financeBudgetPlannerApi";

type SubmissionStatus =
  | "Adding Products"
  | "Adding BOM"
  | "Planning Budget"
  | "Ready for Admin"
  | "Submitted to Admin"
  | "Revision Requested"
  | "Released to Production";

type SubmissionItem = {
  collectionId: number;
  id: string;
  collectionName: string;
  season: string;
  status: SubmissionStatus;
  completion: number;
  productCount: number;
  bomReadyProductCount: number;
  bomLineCount: number;
  hasBudgetPlan: boolean;
  canSubmit: boolean;
};

export default function SubmissionCenterPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bomLines, setBomLines] = useState<BomLine[]>([]);
  const [budgetCollectionIds, setBudgetCollectionIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [collectionRows, productRows, bomRows] = await Promise.all([
        collectionsApi.list(),
        productsApi.list(),
        bomApi.list(),
      ]);
      const budgetRows = await financeBudgetPlannerApi.listCollections().catch(() => []);
      setCollections(Array.isArray(collectionRows) ? collectionRows : []);
      setProducts(Array.isArray(productRows) ? productRows : []);
      setBomLines(Array.isArray(bomRows) ? bomRows : []);
      setBudgetCollectionIds(
        new Set(
          (budgetRows ?? [])
            .filter((item) => item.HasSavedPlan)
            .map((item) => Number(item.CollectionID))
            .filter((item) => Number.isFinite(item) && item > 0),
        ),
      );
    } catch {
      setCollections([]);
      setProducts([]);
      setBomLines([]);
      setBudgetCollectionIds(new Set());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const toCollectionProducts = (collection: Collection): Product[] => {
    const collectionName = String(collection.CollectionName ?? "").trim().toLowerCase();
    const collectionSeason = String(collection.Season ?? "").trim().toLowerCase();

    return products.filter((product) => {
      const productCollection = String((product as Product & { Collection?: string }).Collection ?? "")
        .trim()
        .toLowerCase();
      const productSeason = String(product.Season ?? "").trim().toLowerCase();
      return (
        productCollection === collectionName ||
        (collectionSeason.length > 0 && productSeason === collectionSeason) ||
        (collectionSeason.length > 0 && productCollection === collectionSeason)
      );
    });
  };

  const bomByProductId = useMemo(() => {
    const map = new Map<number, BomLine[]>();
    for (const line of bomLines) {
      const key = Number(line.ProductID);
      if (!Number.isFinite(key) || key <= 0) continue;
      const bucket = map.get(key);
      if (bucket) bucket.push(line);
      else map.set(key, [line]);
    }
    return map;
  }, [bomLines]);

  const records = useMemo<SubmissionItem[]>(
    () =>
      collections
        .filter((collection) => String(collection.Status ?? "").toLowerCase() !== "archived")
        .map((collection) => {
          const collectionProducts = toCollectionProducts(collection);
          const productCount = collectionProducts.length;
          const bomReadyProductCount = collectionProducts.filter(
            (product) => (bomByProductId.get(Number(product.ProductID))?.length ?? 0) > 0,
          ).length;
          const bomLineCount = collectionProducts.reduce(
            (sum, product) => sum + (bomByProductId.get(Number(product.ProductID))?.length ?? 0),
            0,
          );

          const normalizedCollectionStatus = String(collection.Status ?? "").trim().toLowerCase();
          const submittedToAdmin =
            normalizedCollectionStatus.includes("submitted") && normalizedCollectionStatus.includes("admin");
          const releasedToProduction = normalizedCollectionStatus.includes("released to production");
          const revisionRequested =
            normalizedCollectionStatus.includes("returned to product manager") ||
            normalizedCollectionStatus.includes("revision") ||
            normalizedCollectionStatus.includes("rejected");
          const hasBudgetPlan = budgetCollectionIds.has(collection.CollectionID);

          let status: SubmissionStatus = "Adding Products";
          let completion = 0;
          if (productCount > 0) {
            if (bomReadyProductCount >= productCount) {
              if (hasBudgetPlan) {
                status = "Ready for Admin";
                completion = 100;
              } else {
                status = "Planning Budget";
                completion = 85;
              }
            } else {
              status = "Adding BOM";
              completion = Math.min(99, Math.round(50 + (bomReadyProductCount / productCount) * 50));
            }
          }
          if (submittedToAdmin) {
            status = "Submitted to Admin";
            completion = 100;
          }
          if (revisionRequested) {
            status = "Revision Requested";
            completion = 100;
          }
          if (releasedToProduction) {
            status = "Released to Production";
            completion = 100;
          }

          const allRequirementsMet = productCount > 0 && bomReadyProductCount >= productCount && hasBudgetPlan;
          const isReadyAfterBudgetPlanning = status === "Ready for Admin";

          return {
            collectionId: collection.CollectionID,
            id: collection.CollectionCode || `COL-${collection.CollectionID}`,
            collectionName: collection.CollectionName || "-",
            season: collection.Season || "-",
            status,
            completion,
            productCount,
            bomReadyProductCount,
            bomLineCount,
            hasBudgetPlan,
            canSubmit: allRequirementsMet && isReadyAfterBudgetPlanning && !submittedToAdmin && !releasedToProduction,
          };
        }),
    [collections, products, bomByProductId, budgetCollectionIds],
  );

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          item.id.toLowerCase().includes(q) ||
          item.collectionName.toLowerCase().includes(q) ||
          item.season.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [records, searchQuery, statusFilter],
  );

  const visibleRecords = useMemo(
    () =>
      filteredRecords.filter(
        (item) => item.status !== "Submitted to Admin" && item.status !== "Released to Production",
      ),
    [filteredRecords],
  );

  const pendingCount = filteredRecords.filter((item) => item.status === "Adding Products" || item.status === "Adding BOM").length;
  const inProgressCount = filteredRecords.filter(
    (item) => item.status === "Planning Budget" || item.status === "Ready for Admin",
  ).length;
  const readyCount = filteredRecords.filter(
    (item) => item.status === "Submitted to Admin" || item.status === "Released to Production",
  ).length;

  const submitPackage = (item: SubmissionItem) => {
    if (!item.canSubmit) return;
    void (async () => {
      try {
        await collectionsApi.update(item.collectionId, { Status: "Submitted to Admin" });
        await loadData();
      } catch {
        // Keep UI state unchanged if submission fails.
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Submission Center</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit collection packages to admin based on product, BOM, and budget-plan completion.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Submission is enabled only when a collection has products, complete BOM, and a budget plan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">{pendingCount}</p>
            <p className="mt-1 text-xs text-slate-500">Collections still adding products or BOM.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-700">{inProgressCount}</p>
            <p className="mt-1 text-xs text-slate-500">Collections currently planning budget or ready for admin.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ready Packages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{readyCount}</p>
            <p className="mt-1 text-xs text-slate-500">Already submitted to admin or released to production.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Packages</CardTitle>
          <CardDescription>
            Progress is computed from real collection, product, and BOM records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            filterLabel="Status Filter"
            placeholder="Search collection code, name, season, status..."
          >
            <div className="space-y-2 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="adding products">Adding Products</SelectItem>
                  <SelectItem value="adding bom">Adding BOM</SelectItem>
                  <SelectItem value="planning budget">Planning Budget</SelectItem>
                  <SelectItem value="ready for admin">Ready for Admin</SelectItem>
                  <SelectItem value="submitted to admin">Submitted to Admin</SelectItem>
                  <SelectItem value="revision requested">Revision Requested</SelectItem>
                  <SelectItem value="released to production">Released to Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TableToolbar>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Loading collection packages...
            </div>
          ) : visibleRecords.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{item.id}</p>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                  <ShieldCheck size={12} />
                  Collection: {item.collectionName} ({item.season})
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Products: {item.productCount} | BOM-ready Products: {item.bomReadyProductCount}/{item.productCount} | BOM Lines: {item.bomLineCount} | Budget Plan: {item.hasBudgetPlan ? "Completed" : "Pending"}
              </p>

              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completion</p>
                  <p className="text-xs font-semibold text-slate-700">{item.completion}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                    style={{ width: `${item.completion}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <PrimaryButton
                  onClick={() => submitPackage(item)}
                  className={`!w-auto !rounded-full !px-4 !py-2 !text-xs ${
                    item.canSubmit
                      ? "!bg-emerald-600 !text-white hover:!bg-emerald-700"
                      : "!cursor-not-allowed !bg-slate-200 !text-slate-500 hover:!bg-slate-200"
                  }`}
                  disabled={!item.canSubmit}
                >
                  <Send size={13} />
                  {item.status === "Revision Requested" ? "Submit Revised Package" : "Submit Package"}
                </PrimaryButton>
                {!item.canSubmit && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    Enable when status is Ready for Admin (after budget planning).
                  </span>
                )}
                {item.status === "Submitted to Admin" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={12} />
                    Submitted to Admin
                  </span>
                )}
              </div>
            </div>
          ))}

          {visibleRecords.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No submission records found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
