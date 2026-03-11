import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, CalendarClock, Eye, FolderKanban, Package2, Shapes, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Input } from "../../components/ui/input";
import { collectionsApi, type Collection } from "../../lib/api/collectionsApi";
import { productsApi, type Product } from "../../lib/api/productsApi";
import TabBar from "../../components/ui/TabBar";
import DetailsModal from "../../components/ui/DetailsModal";

type ArchiveTab = "products" | "collections";

export default function PLMArchivesPage() {
  const [activeTab, setActiveTab] = useState<ArchiveTab>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const loadArchived = async () => {
    setIsLoading(true);
    try {
      const [productData, collectionData] = await Promise.all([
        productsApi.listArchived(),
        collectionsApi.listArchived(),
      ]);
      setProducts(productData);
      setCollections(collectionData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadArchived();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        if (!normalizedQuery) return true;
        return (
          String(item.SKU ?? "").toLowerCase().includes(normalizedQuery) ||
          String(item.Name ?? "").toLowerCase().includes(normalizedQuery) ||
          String(item.Category ?? "").toLowerCase().includes(normalizedQuery) ||
          String(item.Season ?? "").toLowerCase().includes(normalizedQuery)
        );
      }),
    [products, normalizedQuery],
  );

  const filteredCollections = useMemo(
    () =>
      collections.filter((item) => {
        if (!normalizedQuery) return true;
        return (
          String(item.CollectionCode ?? "").toLowerCase().includes(normalizedQuery) ||
          String(item.CollectionName ?? "").toLowerCase().includes(normalizedQuery) ||
          String(item.Season ?? "").toLowerCase().includes(normalizedQuery)
        );
      }),
    [collections, normalizedQuery],
  );

  const restoreProduct = async (id: number) => {
    await productsApi.restore(id);
    setProducts((prev) => prev.filter((x) => x.ProductID !== id));
  };

  const restoreCollection = async (id: number) => {
    await collectionsApi.restore(id);
    setCollections((prev) => prev.filter((x) => x.CollectionID !== id));
  };

  const tabs = [
    { id: "products", label: "Products", icon: Package2, count: filteredProducts.length },
    { id: "collections", label: "Collections", icon: FolderKanban, count: filteredCollections.length },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Archives</h1>
        <p className="mt-1 text-sm text-slate-500">
          Archived records are soft-deleted and can be restored anytime.
        </p>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">PLM Archive Center</CardTitle>
          <CardDescription>View and restore archived products and collections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search archived ${activeTab}...`}
          />

          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as ArchiveTab)}
          />

          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Loading archived records...
            </div>
          ) : activeTab === "products" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead className="text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      No archived products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((item) => (
                    <TableRow key={item.ProductID}>
                      <TableCell>{item.SKU}</TableCell>
                      <TableCell>{item.Name}</TableCell>
                      <TableCell>{item.Category}</TableCell>
                      <TableCell>{item.Season}</TableCell>
                      <TableCell className="text-left">
                        <SecondaryButton
                          icon={Eye}
                          className="!mr-2 !rounded-lg !px-3 !py-2"
                          ariaLabel={`View ${item.Name} details`}
                          onClick={() => setSelectedProduct(item)}
                        >
                          <span>Details</span>
                        </SecondaryButton>
                        <SecondaryButton
                          icon={ArchiveRestore}
                          className="!rounded-lg !px-3 !py-2"
                          ariaLabel={`Restore ${item.Name}`}
                          onClick={() => restoreProduct(item.ProductID)}
                        >
                          <span>Restore</span>
                        </SecondaryButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead className="text-left">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                      No archived collections found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((item) => (
                    <TableRow key={item.CollectionID}>
                      <TableCell>{item.CollectionCode}</TableCell>
                      <TableCell>{item.CollectionName}</TableCell>
                      <TableCell>{item.Season}</TableCell>
                      <TableCell className="text-left">
                        <SecondaryButton
                          icon={Eye}
                          className="!mr-2 !rounded-lg !px-3 !py-2"
                          ariaLabel={`View ${item.CollectionName} details`}
                          onClick={() => setSelectedCollection(item)}
                        >
                          <span>Details</span>
                        </SecondaryButton>
                        <SecondaryButton
                          icon={ArchiveRestore}
                          className="!rounded-lg !px-3 !py-2"
                          ariaLabel={`Restore ${item.CollectionName}`}
                          onClick={() => restoreCollection(item.CollectionID)}
                        >
                          <span>Restore</span>
                        </SecondaryButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        title="Archived Product Details"
        itemId={String(selectedProduct?.ProductID ?? "-")}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Package2 size={16} />
          </div>
        }
        gridFields={
          selectedProduct
            ? [
                { label: "SKU", value: selectedProduct.SKU || "-", icon: Tag },
                { label: "Name", value: selectedProduct.Name || "-", icon: Shapes },
                { label: "Category", value: selectedProduct.Category || "-", icon: Shapes },
                { label: "Season", value: selectedProduct.Season || "-", icon: CalendarClock },
              ]
            : []
        }
        footerActions={
          selectedProduct ? (
            <SecondaryButton
              icon={ArchiveRestore}
              className="!rounded-xl !px-4 !py-2.5 !text-xs"
              onClick={async () => {
                await restoreProduct(selectedProduct.ProductID);
                setSelectedProduct(null);
              }}
            >
              Restore Product
            </SecondaryButton>
          ) : null
        }
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Archive Note</p>
          <p className="text-sm text-slate-700">
            This product is currently archived and hidden from active PLM workflows.
          </p>
        </div>
      </DetailsModal>

      <DetailsModal
        isOpen={selectedCollection !== null}
        onClose={() => setSelectedCollection(null)}
        title="Archived Collection Details"
        itemId={String(selectedCollection?.CollectionID ?? "-")}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <FolderKanban size={16} />
          </div>
        }
        gridFields={
          selectedCollection
            ? [
                { label: "Code", value: selectedCollection.CollectionCode || "-", icon: Tag },
                { label: "Name", value: selectedCollection.CollectionName || "-", icon: FolderKanban },
                { label: "Season", value: selectedCollection.Season || "-", icon: CalendarClock },
                { label: "Status", value: selectedCollection.Status || "Archived", icon: Shapes },
              ]
            : []
        }
        footerActions={
          selectedCollection ? (
            <SecondaryButton
              icon={ArchiveRestore}
              className="!rounded-xl !px-4 !py-2.5 !text-xs"
              onClick={async () => {
                await restoreCollection(selectedCollection.CollectionID);
                setSelectedCollection(null);
              }}
            >
              Restore Collection
            </SecondaryButton>
          ) : null
        }
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Archive Note</p>
          <p className="text-sm text-slate-700">
            This collection is archived and excluded from active planning and submission flows.
          </p>
        </div>
      </DetailsModal>
    </div>
  );
}
