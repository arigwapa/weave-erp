import { useEffect, useMemo, useState } from "react";
import { ArchiveRestore, FolderKanban, Package2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import { Input } from "../../components/ui/input";
import { collectionsApi, type Collection } from "../../lib/api/collectionsApi";
import { productsApi, type Product } from "../../lib/api/productsApi";
import TabBar from "../../components/ui/TabBar";

type ArchiveTab = "products" | "collections";

export default function PLMArchivesPage() {
  const [activeTab, setActiveTab] = useState<ArchiveTab>("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Archives</h1>
        <p className="mt-1 text-sm text-slate-500">
          Archived records are soft-deleted and can be restored anytime.
        </p>
      </div>

      <Card className="rounded-2xl">
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
    </div>
  );
}
