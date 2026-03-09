import { useEffect, useMemo, useState } from "react";
import { Calculator, CheckCircle2, Package2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SecondaryButton from "../../components/ui/SecondaryButton";
import DetailsModal from "../../components/ui/DetailsModal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { financeCostingWorkbenchApi } from "../../lib/api/financeCostingWorkbenchApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

type CostingBOMLine = {
  material: string;
  qty: number;
  unit: string;
  unitCost: number;
  wastage: number;
};

type ProductCostRecord = {
  id: string;
  productId: number;
  collectionId: number;
  productCode: string;
  productName: string;
  collection: string;
  collectionCode: string;
  collectionName: string;
  sizeProfile: string;
  bomVersion: string;
  status: "Validated" | "For Review" | "Draft";
  scenarioPricing: { label: string; value: string }[];
  costSummary: { level: string; total: string }[];
  bomLines: CostingBOMLine[];
};

type CollectionCostRecord = {
  key: string;
  collectionId: number;
  collectionCode: string;
  collectionName: string;
  status: "Validated" | "For Review" | "Draft" | "For Budget Planning";
  totalBudget: number;
  productCount: number;
  bomLineCount: number;
  products: ProductCostRecord[];
};

export default function CostingWorkbenchPage() {
  const [records, setRecords] = useState<ProductCostRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApprovingCollection, setIsApprovingCollection] = useState(false);
  const [collectionStatusOverrides, setCollectionStatusOverrides] = useState<
    Record<number, CollectionCostRecord["status"]>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState<CollectionCostRecord | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductCostRecord | null>(null);

  const formatSizeProfileText = (raw: string): string => {
    const clean = String(raw ?? "").trim();
    if (!clean) return "S / M / L / XL / XXL";

    // Handles serialized size matrix JSON from PLM (e.g. {"S": {...}, "M": {...}}).
    if (clean.startsWith("{")) {
      try {
        const parsed = JSON.parse(clean) as Record<string, unknown>;
        const preferredOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
        const keys = Object.keys(parsed).map((key) => key.trim().toUpperCase());
        const ordered = preferredOrder.filter((size) => keys.includes(size));
        if (ordered.length > 0) return ordered.join(" / ");
        if (keys.length > 0) return keys.join(" / ");
      } catch {
        // Fallback to string cleanup below.
      }
    }

    return clean
      .replaceAll(",", " / ")
      .replaceAll("|", " / ")
      .replace(/\s*\/\s*/g, " / ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const loadSubmittedPackages = async () => {
    setIsLoading(true);
    try {
      const queue = await financeCostingWorkbenchApi.listQueue();
      const next: ProductCostRecord[] = [];
      const nextCollectionOverrides: Record<number, CollectionCostRecord["status"]> = {};
      queue.forEach((collection) => {
        const collectionStatus = String(collection.CostingStatus || collection.Status || "")
          .trim()
          .toLowerCase();
        if (collectionStatus === "for budget planning") {
          nextCollectionOverrides[Number(collection.CollectionID)] = "For Budget Planning";
        }
        collection.Products.forEach((product) => {
          const mappedLines: CostingBOMLine[] = product.BomLines.map((line) => ({
            material: line.MaterialName,
            qty: Number(line.QtyRequired),
            unit: line.Unit,
            unitCost: Number(line.UnitCost),
            wastage: 0,
          }));
          const productTotal = Number(product.TotalCost);
          const optimistic = productTotal * 0.95;
          const conservative = productTotal * 1.08;
          const backendStatus = String(product.CostingStatus ?? "").trim().toLowerCase();
          const status: ProductCostRecord["status"] =
            backendStatus === "validated"
              ? "Validated"
              : backendStatus === "for review"
                ? "For Review"
                : "Draft";

          next.push({
            id: `${collection.CollectionCode || `COL-${collection.CollectionID}`}-${product.ProductID}`,
            productId: Number(product.ProductID),
            collectionId: Number(collection.CollectionID),
            productCode: product.SKU,
            productName: product.Name,
            collection: `${collection.CollectionCode} (${collection.CollectionName})`,
            collectionCode: collection.CollectionCode || `COL-${collection.CollectionID}`,
            collectionName: collection.CollectionName || "-",
            sizeProfile: formatSizeProfileText(product.SizeProfile || ""),
            bomVersion: product.BomVersion || (mappedLines.length > 0 ? "V1" : "-"),
            status,
            scenarioPricing: [
              { label: "Optimistic", value: `PHP ${optimistic.toFixed(2)}` },
              { label: "Baseline", value: `PHP ${productTotal.toFixed(2)}` },
              { label: "Conservative", value: `PHP ${conservative.toFixed(2)}` },
            ],
            costSummary: [
              { level: "Material Lines", total: String(mappedLines.length) },
              { level: "Product Total", total: `PHP ${productTotal.toFixed(2)}` },
            ],
            bomLines: mappedLines,
          });
        });
      });

      setRecords(next);
      setCollectionStatusOverrides(nextCollectionOverrides);
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSubmittedPackages();
  }, []);

  const collectionRecords = useMemo<CollectionCostRecord[]>(() => {
    const grouped = new Map<number, CollectionCostRecord>();
    records.forEach((product) => {
      const key = product.collectionId;
      const current = grouped.get(key);
      const productBudget = product.bomLines.reduce((sum, line) => sum + line.qty * line.unitCost, 0);
      if (!current) {
        grouped.set(key, {
          key: String(key),
          collectionId: key,
          collectionCode: product.collectionCode,
          collectionName: product.collectionName,
          status: product.status,
          totalBudget: productBudget,
          productCount: 1,
          bomLineCount: product.bomLines.length,
          products: [product],
        });
        return;
      }

      current.products.push(product);
      current.productCount += 1;
      current.bomLineCount += product.bomLines.length;
      current.totalBudget += productBudget;
      if (current.status !== "Draft" && product.status === "Draft") current.status = "Draft";
      else if (current.status === "Validated" && product.status === "For Review") current.status = "For Review";
    });

    return Array.from(grouped.values()).map((collection) => ({
      ...collection,
      status: collectionStatusOverrides[collection.collectionId] ?? collection.status,
    }));
  }, [records, collectionStatusOverrides]);

  const filteredCollections = useMemo(
    () =>
      collectionRecords.filter((item) => {
        const matchesSearch =
          item.collectionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.collectionName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      }),
    [collectionRecords, searchQuery, statusFilter],
  );

  const canApproveCollection =
    selectedCollection !== null &&
    selectedCollection.products.length > 0 &&
    selectedCollection.products.every((item) => item.status === "Validated") &&
    selectedCollection.status !== "For Budget Planning";

  const approveProduct = async (target: ProductCostRecord) => {
    if (isApproving) return;
    setIsApproving(true);
    try {
      await financeCostingWorkbenchApi.approveProduct(target.productId);

      setRecords((prev) =>
        prev.map((item) => (item.id === target.id ? { ...item, status: "Validated" } : item)),
      );
      setSelectedProduct((prev) => (prev && prev.id === target.id ? { ...prev, status: "Validated" } : prev));
      setSelectedCollection((prev) =>
        prev
          ? (() => {
              const products: ProductCostRecord[] = prev.products.map((item) =>
                item.id === target.id ? { ...item, status: "Validated" } : item,
              );
              const nextStatus: CollectionCostRecord["status"] = products.every(
                (item) => item.status === "Validated",
              )
              ? prev.status === "For Budget Planning"
                ? "For Budget Planning"
                : "Validated"
                : products.some((item) => item.status === "For Review")
                  ? "For Review"
                  : "Draft";
              return { ...prev, products, status: nextStatus };
            })()
          : prev,
      );
    } catch {
      // Keep existing UI state if approval update fails.
    } finally {
      setIsApproving(false);
    }
  };

  const approveCollection = async (target: CollectionCostRecord) => {
    if (isApprovingCollection) return;
    setIsApprovingCollection(true);
    try {
      await financeCostingWorkbenchApi.approveCollection(target.collectionId);
      setCollectionStatusOverrides((prev) => ({
        ...prev,
        [target.collectionId]: "For Budget Planning",
      }));
      setSelectedCollection((prev) =>
        prev && prev.collectionId === target.collectionId
          ? { ...prev, status: "For Budget Planning" }
          : prev,
      );
    } catch {
      // Keep current UI state if collection approval fails.
    } finally {
      setIsApprovingCollection(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Costing Workbench</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pull product/BOM from Product Manager, validate assumptions, and model pricing scenarios.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Product pricing can only be submitted when BOM validation and scenario review are complete.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Collection Costing Queue</CardTitle>
          <CardDescription>
            Select a collection card to review collection-level budget and costing-ready products.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search collection code or collection name..."
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="for review">For Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="for budget planning">For Budget Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCollections.map((collection) => (
              <button
                key={collection.key}
                onClick={() => setSelectedCollection(collection)}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{collection.collectionCode}</p>
                    <p className="text-xs text-slate-500">{collection.collectionName}</p>
                  </div>
                  <StatusBadge status={collection.status} />
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p>Products: {collection.productCount}</p>
                  <p>BOM Lines: {collection.bomLineCount}</p>
                  <p>Total Budget: PHP {collection.totalBudget.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredCollections.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {isLoading ? "Loading submitted PLM packages..." : "No submitted PLM packages found."}
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-center gap-2">
              <Calculator size={14} />
              Guardrail: scenario outputs should be reviewed before final costing approval.
            </div>
          </div>
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedCollection !== null}
        onClose={() => {
          setSelectedCollection(null);
          setSelectedProduct(null);
        }}
        title={selectedCollection ? `${selectedCollection.collectionCode} Collection Package` : "Collection Package"}
        itemId={selectedCollection?.key ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Package2 size={16} />
          </div>
        }
        gridFields={
          selectedCollection
            ? [
                { label: "Collection Code", value: selectedCollection.collectionCode, icon: Package2 },
                { label: "Collection Name", value: selectedCollection.collectionName, icon: Package2 },
                { label: "Products", value: String(selectedCollection.productCount), icon: Package2 },
                { label: "BOM Lines", value: String(selectedCollection.bomLineCount), icon: Package2 },
                { label: "Status", value: <StatusBadge status={selectedCollection.status} />, icon: ShieldCheck },
              ]
            : []
        }
        footerActions={
          selectedCollection &&
          (canApproveCollection || selectedCollection.status === "For Budget Planning") ? (
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              isLoading={isApprovingCollection}
              disabled={!canApproveCollection}
              onClick={() => {
                if (!selectedCollection || !canApproveCollection) return;
                void approveCollection(selectedCollection);
              }}
            >
              {selectedCollection.status === "For Budget Planning"
                ? "Collection Approved"
                : "Approve Collection"}
            </PrimaryButton>
          ) : undefined
        }
      >
        {selectedCollection && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Budget Needed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">
                PHP {selectedCollection.totalBudget.toFixed(2)}
              </p>
            </div>

            <Card className="rounded-xl border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Products</CardTitle>
                <CardDescription>
                  Click a product card to review BOM, BOM validation, pricing, and cost summary.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedCollection.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="aspect-square rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{product.productName}</p>
                          <p className="text-xs text-slate-500">{product.productCode}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600">BOM: {product.bomVersion}</p>
                          <StatusBadge status={product.status} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DetailsModal>

      <DetailsModal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? `${selectedProduct.productName} Costing Package` : "Costing Package"}
        itemId={selectedProduct?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Package2 size={16} />
          </div>
        }
        gridFields={
          selectedProduct
            ? [
                { label: "Product Code", value: selectedProduct.productCode, icon: Package2 },
                { label: "Collection", value: selectedProduct.collection, icon: Package2 },
                { label: "Size Profile", value: selectedProduct.sizeProfile, icon: Package2 },
                { label: "BOM Version", value: selectedProduct.bomVersion, icon: Package2 },
                { label: "Status", value: <StatusBadge status={selectedProduct.status} />, icon: ShieldCheck },
                { label: "Record", value: selectedProduct.id, icon: ShieldCheck },
              ]
            : []
        }
        zIndexClass="z-[95]"
        footerActions={
          <>
            <SecondaryButton icon={CheckCircle2}>Validate Assumptions</SecondaryButton>
            <PrimaryButton
              className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs"
              isLoading={isApproving}
              disabled={!selectedProduct || selectedProduct.status === "Validated"}
              onClick={() => {
                if (!selectedProduct) return;
                void approveProduct(selectedProduct);
              }}
            >
              {selectedProduct?.status === "Validated" ? "Approved" : "Approve"}
            </PrimaryButton>
          </>
        }
      >
        {selectedProduct && (
          <div className="space-y-4">
            <Card className="rounded-xl border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">BOM</CardTitle>
                <CardDescription>Material-level line items used for costing.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Wastage %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProduct.bomLines.map((line) => (
                      <TableRow key={`${line.material}-${line.unit}`}>
                        <TableCell>{line.material}</TableCell>
                        <TableCell>{line.qty}</TableCell>
                        <TableCell>{line.unit}</TableCell>
                        <TableCell>PHP {line.unitCost}</TableCell>
                        <TableCell>{line.wastage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">BOM Validation</CardTitle>
                <CardDescription>Validate unit costs and quantity assumptions from PLM records.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Source: {selectedProduct.id} / {selectedProduct.productCode} / BOM {selectedProduct.bomVersion}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  Last Sync: Just now
                </span>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="rounded-xl border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Scenario Pricing</CardTitle>
                  <CardDescription>Optimistic, baseline, and conservative projections.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedProduct.scenarioPricing.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cost Summary</CardTitle>
                  <CardDescription>Size-level and rolled-up totals.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Level</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProduct.costSummary.map((row) => (
                        <TableRow key={row.level}>
                          <TableCell className={row.level.includes("Total") ? "font-semibold" : ""}>{row.level}</TableCell>
                          <TableCell className={row.level.includes("Total") ? "font-semibold" : ""}>{row.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DetailsModal>
    </div>
  );
}
