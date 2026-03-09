import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarClock, Eye, Layers, Pencil, ShieldCheck, ToggleLeft, ToggleRight, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import DetailsModal from "../../components/ui/DetailsModal";
import {
  loadMaterials,
  saveMaterials,
  type MaterialRecord,
  type MaterialStatus,
} from "../../lib/materialStorage";
import { useAuth } from "../../lib/AuthContext";
import { materialsApi, type Material } from "../../lib/api/materialsApi";

type MaterialForm = {
  name: string;
  category: string;
  unit: string;
  price: string;
  supplier: string;
  notes: string;
};

type MaterialFieldErrors = Partial<Record<"name" | "category" | "unit" | "price" | "supplier" | "notes", string>>;

const emptyForm: MaterialForm = {
  name: "",
  category: "",
  unit: "",
  price: "",
  supplier: "",
  notes: "",
};

const MATERIAL_CATEGORY_UNIT_OPTIONS = [
  { category: "Fabric", unit: "meters" },
  { category: "Lining Fabric", unit: "meters" },
  { category: "Interfacing", unit: "meters" },
  { category: "Fusible Interfacing", unit: "meters" },
  { category: "Elastic", unit: "meters" },
  { category: "Ribbon", unit: "meters" },
  { category: "Lace", unit: "meters" },
  { category: "Webbing", unit: "meters" },
  { category: "Sewing Thread", unit: "spool" },
  { category: "Embroidery Thread", unit: "spool" },
  { category: "Buttons", unit: "piece" },
  { category: "Zippers", unit: "piece" },
  { category: "Snap Buttons", unit: "set" },
  { category: "Hooks and Eyes", unit: "set" },
  { category: "Velcro (Hook & Loop)", unit: "meters" },
  { category: "Labels (Brand Labels)", unit: "piece" },
  { category: "Care Labels", unit: "piece" },
  { category: "Hang Tags", unit: "piece" },
  { category: "Drawstrings", unit: "piece" },
  { category: "Cord Locks", unit: "piece" },
  { category: "Eyelets", unit: "piece" },
  { category: "Rivets", unit: "piece" },
  { category: "Buckles", unit: "piece" },
  { category: "Shoulder Pads", unit: "pair" },
  { category: "Foam Padding", unit: "piece" },
  { category: "Beads", unit: "pack" },
  { category: "Sequins", unit: "pack" },
  { category: "Patches", unit: "piece" },
  { category: "Appliques", unit: "piece" },
  { category: "Belt Hardware", unit: "set" },
  { category: "Toggle Buttons", unit: "piece" },
] as const;

const CATEGORY_TO_UNIT: Record<string, string> = MATERIAL_CATEGORY_UNIT_OPTIONS.reduce(
  (acc, item) => {
    acc[item.category] = item.unit;
    return acc;
  },
  {} as Record<string, string>,
);

const UNIT_OPTIONS = Array.from(new Set(MATERIAL_CATEGORY_UNIT_OPTIONS.map((item) => item.unit)));

function AddEditMaterialModal({
  isOpen,
  isEditing,
  form,
  fieldErrors,
  formError,
  onClose,
  onChange,
  onSave,
}: {
  isOpen: boolean;
  isEditing: boolean;
  form: MaterialForm;
  fieldErrors: MaterialFieldErrors;
  formError: string;
  onClose: () => void;
  onChange: (updates: Partial<MaterialForm>) => void;
  onSave: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">{isEditing ? "Edit Material" : "Add Material"}</h3>
          <p className="text-xs text-slate-500">Manage material cost, supplier, and category references.</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Material Name</Label>
            <Input
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Organic Cotton Twill"
              className={fieldErrors.name ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.name ? <p className="text-xs text-rose-600">{fieldErrors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(value) =>
                onChange({
                  category: value,
                  unit: CATEGORY_TO_UNIT[value] ?? form.unit,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_CATEGORY_UNIT_OPTIONS.map((item) => (
                  <SelectItem key={item.category} value={item.category}>
                    {item.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.category ? <p className="text-xs text-rose-600">{fieldErrors.category}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={form.unit} onValueChange={(value) => onChange({ unit: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {!UNIT_OPTIONS.includes(form.unit as (typeof UNIT_OPTIONS)[number]) && form.unit ? (
                  <SelectItem value={form.unit}>{form.unit}</SelectItem>
                ) : null}
                {UNIT_OPTIONS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.unit ? <p className="text-xs text-rose-600">{fieldErrors.unit}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              value={form.price}
              onChange={(e) => onChange({ price: e.target.value })}
              placeholder="180"
              className={fieldErrors.price ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.price ? <p className="text-xs text-rose-600">{fieldErrors.price}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Input
              value={form.supplier}
              onChange={(e) => onChange({ supplier: e.target.value })}
              placeholder="Textile Source Co."
              className={fieldErrors.supplier ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.supplier ? <p className="text-xs text-rose-600">{fieldErrors.supplier}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Material usage notes and procurement remarks."
              className={fieldErrors.notes ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.notes ? <p className="text-xs text-rose-600">{fieldErrors.notes}</p> : null}
          </div>
          {formError ? (
            <p className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {formError}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onSave} className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            {isEditing ? "Save Changes" : "Create Material"}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function MaterialListPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialRecord[]>(loadMaterials());
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<MaterialFieldErrors>({});
  const [formError, setFormError] = useState("");

  const mapBackendMaterial = (item: Material): MaterialRecord => ({
    id: String(item.MaterialID),
    materialId: item.MaterialID,
    name: item.Name,
    category: item.Type,
    unit: item.Unit,
    price: Number(item.UnitCost ?? 0),
    supplier: item.SupplierName ?? "",
    status: (item.Status as MaterialStatus) || "Active",
    notes: item.Notes ?? "",
    lastUpdated: String(item.UpdatedAt ?? item.CreatedAt ?? "").slice(0, 10),
    createdByUserID: item.CreatedByUserID,
    createdAt: item.CreatedAt,
    updatedByUserID: item.UpdatedByUserID ?? null,
    updatedAt: item.UpdatedAt ?? null,
  });

  const loadMaterialsFromBackend = async () => {
    const records = await materialsApi.list();
    const mapped = records.map(mapBackendMaterial);
    setMaterials(mapped);
    saveMaterials(mapped);
  };

  useEffect(() => {
    void (async () => {
      try {
        await loadMaterialsFromBackend();
      } catch {
        setMaterials(loadMaterials());
      }
    })();
  }, []);

  const months = useMemo(
    () => Array.from(new Set(materials.map((item) => item.lastUpdated.slice(0, 7)))).sort(),
    [materials],
  );

  const filteredMaterials = useMemo(
    () =>
      materials.filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.supplier.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesMonth = monthFilter === "all" || item.lastUpdated.startsWith(monthFilter);
        return matchesQuery && matchesStatus && matchesMonth;
      }),
    [materials, searchQuery, statusFilter, monthFilter],
  );

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMaterials.length);
  const pagedMaterials = filteredMaterials.slice(startIndex, endIndex);

  const activeCount = filteredMaterials.filter((item) => item.status === "Active").length;

  const validateForm = (values: MaterialForm): MaterialFieldErrors => {
    const errors: MaterialFieldErrors = {};
    if (!values.name.trim()) errors.name = "Material name is required.";
    else if (values.name.trim().length > 180) errors.name = "Material name must be at most 180 characters.";

    if (!values.category.trim()) errors.category = "Material type is required.";
    else if (values.category.trim().length > 80) errors.category = "Material type must be at most 80 characters.";

    if (!values.unit.trim()) errors.unit = "Unit is required.";
    else if (values.unit.trim().length > 20) errors.unit = "Unit must be at most 20 characters.";

    if (!values.price.trim()) errors.price = "Unit cost is required.";
    else {
      const numericPrice = Number(values.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) errors.price = "Unit cost must be 0 or greater.";
    }

    if (values.supplier.trim().length > 160) errors.supplier = "Supplier name must be at most 160 characters.";
    if (values.notes.trim().length > 1000) errors.notes = "Notes must be at most 1000 characters.";
    return errors;
  };

  const hasErrors = (errors: MaterialFieldErrors) => Object.values(errors).some(Boolean);

  const mapValidationErrors = (raw?: Record<string, string[] | string>): MaterialFieldErrors => {
    if (!raw) return {};
    const mapped: MaterialFieldErrors = {};
    for (const [key, value] of Object.entries(raw)) {
      const first = (Array.isArray(value) ? value : [value]).find(
        (entry) => typeof entry === "string" && entry.trim().length > 0,
      );
      if (!first) continue;
      const normalized = key.toLowerCase();
      if (normalized.includes("name")) mapped.name = first;
      else if (normalized.includes("type") || normalized.includes("category")) mapped.category = first;
      else if (normalized.includes("unitcost") || normalized.includes("price")) mapped.price = first;
      else if (normalized.includes("unit")) mapped.unit = first;
      else if (normalized.includes("suppliername") || normalized.includes("supplier")) mapped.supplier = first;
      else if (normalized.includes("notes")) mapped.notes = first;
    }
    return mapped;
  };

  const openAdd = () => {
    setEditingId(null);
    setFieldErrors({});
    setFormError("");
    setForm({
      ...emptyForm,
      category: MATERIAL_CATEGORY_UNIT_OPTIONS[0].category,
      unit: MATERIAL_CATEGORY_UNIT_OPTIONS[0].unit,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: MaterialRecord) => {
    setEditingId(item.id);
    setFieldErrors({});
    setFormError("");
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      price: String(item.price),
      supplier: item.supplier,
      notes: item.notes,
    });
    setIsModalOpen(true);
  };

  const saveMaterial = () => {
    const clientErrors = validateForm(form);
    setFieldErrors(clientErrors);
    setFormError("");
    if (hasErrors(clientErrors)) return;
    void (async () => {
      const nowIso = new Date().toISOString();
      const numericPrice = Number(form.price);
      if (!Number.isFinite(numericPrice) || numericPrice < 0) return;

      try {
        if (editingId) {
          const id = Number(editingId);
          const existing = materials.find((item) => item.id === editingId);
          if (!Number.isFinite(id) || !existing) return;

          await materialsApi.update(id, {
            MaterialID: id,
            Name: form.name.trim(),
            Type: form.category.trim(),
            Unit: form.unit.trim(),
            UnitCost: numericPrice,
            SupplierName: form.supplier.trim() || undefined,
            Notes: form.notes.trim() || undefined,
            Status: existing.status,
            CreatedByUserID: existing.createdByUserID ?? user?.userID ?? 1,
            CreatedAt: existing.createdAt ?? nowIso,
            UpdatedByUserID: user?.userID ?? existing.updatedByUserID ?? null,
            UpdatedAt: nowIso,
          });
        } else {
          await materialsApi.create({
            Name: form.name.trim(),
            Type: form.category.trim(),
            Unit: form.unit.trim(),
            UnitCost: numericPrice,
            SupplierName: form.supplier.trim() || undefined,
            Notes: form.notes.trim() || undefined,
            Status: "Active",
            CreatedByUserID: user?.userID ?? 1,
            CreatedAt: nowIso,
            UpdatedByUserID: null,
            UpdatedAt: null,
          });
        }

        await loadMaterialsFromBackend();
        setIsModalOpen(false);
        setEditingId(null);
        setForm(emptyForm);
        setFieldErrors({});
        setFormError("");
      } catch (error) {
        const validationErrors =
          typeof error === "object" && error !== null && "validationErrors" in error
            ? (error as { validationErrors?: Record<string, string[] | string> }).validationErrors
            : undefined;
        const mapped = mapValidationErrors(validationErrors);
        setFieldErrors(mapped);
        const first = Object.values(mapped).find(Boolean);
        setFormError(first || (error instanceof Error ? error.message : "Failed to save material."));
      }
    })();
  };

  const archiveMaterial = (id: string) => {
    void (async () => {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) return;
      await materialsApi.archive(numericId);
      await loadMaterialsFromBackend();
    })();
  };

  const toggleMaterialStatus = (item: MaterialRecord) => {
    if (item.status === "Archived") return;
    void (async () => {
      const numericId = Number(item.id);
      if (!Number.isFinite(numericId)) return;
      const nextStatus: MaterialStatus = item.status === "Active" ? "Inactive" : "Active";
      const nowIso = new Date().toISOString();
      await materialsApi.update(numericId, {
        MaterialID: numericId,
        Name: item.name,
        Type: item.category,
        Unit: item.unit,
        UnitCost: item.price,
        SupplierName: item.supplier || undefined,
        Notes: item.notes || undefined,
        Status: nextStatus,
        CreatedByUserID: item.createdByUserID ?? user?.userID ?? 1,
        CreatedAt: item.createdAt ?? nowIso,
        UpdatedByUserID: user?.userID ?? item.updatedByUserID ?? null,
        UpdatedAt: nowIso,
      });
      await loadMaterialsFromBackend();
    })();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Material List</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create and maintain material references, pricing, and supplier metadata for BOM usage.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Materials should include unit, current price, and supplier before being used in BOM.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Visible Materials</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredMaterials.length}</p>
            <p className="mt-1 text-xs text-slate-500">Materials matching current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">{activeCount}</p>
            <p className="mt-1 text-xs text-slate-500">Available for BOM selection.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Avg Price</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-700">
              PHP {filteredMaterials.length ? Math.round(filteredMaterials.reduce((a, b) => a + b.price, 0) / filteredMaterials.length) : 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">Average unit price by current view.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Materials Registry</CardTitle>
          <CardDescription>Search and manage materials that drive BOM pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Filters"
              placeholder="Search material, category, supplier..."
              onAdd={openAdd}
              addLabel="Add Material"
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setMonthFilter("all");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
            >
              <div className="space-y-3 p-3">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Month</p>
                  <Select value={monthFilter} onValueChange={(v) => { setMonthFilter(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All months" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableToolbar>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pl-6 text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                    No materials found for selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                pagedMaterials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="px-6">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.id}</p>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>PHP {item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell className="pl-6">
                      <div className="flex items-center justify-start gap-2">
                        <SecondaryButton icon={Eye} className="!rounded-lg !px-2 !py-2" onClick={() => setSelectedMaterial(item)}>
                          <span className="sr-only">Details</span>
                        </SecondaryButton>
                        <SecondaryButton icon={Pencil} className="!rounded-lg !px-2 !py-2" onClick={() => openEdit(item)}>
                          <span className="sr-only">Edit</span>
                        </SecondaryButton>
                        <SecondaryButton
                          icon={item.status === "Active" ? ToggleRight : ToggleLeft}
                          className="!rounded-lg !px-2 !py-2"
                          ariaLabel={item.status === "Active" ? `Set ${item.name} inactive` : `Set ${item.name} active`}
                          onClick={() => toggleMaterialStatus(item)}
                        >
                          <span className="sr-only">{item.status === "Active" ? "Set Inactive" : "Set Active"}</span>
                        </SecondaryButton>
                        <SecondaryButton icon={Archive} className="!rounded-lg !px-2 !py-2" onClick={() => archiveMaterial(item.id)}>
                          <span className="sr-only">Archive</span>
                        </SecondaryButton>
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
            totalItems={filteredMaterials.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      <DetailsModal
        isOpen={selectedMaterial !== null}
        onClose={() => setSelectedMaterial(null)}
        title="Material Details"
        itemId={selectedMaterial?.id ?? "-"}
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Layers size={16} />
          </div>
        }
        gridFields={
          selectedMaterial
            ? [
                { label: "Name", value: selectedMaterial.name, icon: Layers },
                { label: "Category", value: selectedMaterial.category, icon: Layers },
                { label: "Unit", value: selectedMaterial.unit, icon: ShieldCheck },
                { label: "Price", value: `PHP ${selectedMaterial.price.toFixed(2)}`, icon: ShieldCheck },
                { label: "Supplier", value: selectedMaterial.supplier, icon: Truck },
                { label: "Updated", value: selectedMaterial.lastUpdated, icon: CalendarClock },
              ]
            : []
        }
      >
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Notes</p>
          <p className="mt-1 text-sm text-slate-700">{selectedMaterial?.notes ?? "-"}</p>
        </div>
      </DetailsModal>

      <AddEditMaterialModal
        isOpen={isModalOpen}
        isEditing={editingId !== null}
        form={form}
        fieldErrors={fieldErrors}
        formError={formError}
        onClose={() => {
          setIsModalOpen(false);
          setFieldErrors({});
          setFormError("");
        }}
        onChange={(updates) => {
          setForm((prev) => ({ ...prev, ...updates }));
          setFieldErrors((prev) => {
            const next = { ...prev };
            if ("name" in updates) delete next.name;
            if ("category" in updates) delete next.category;
            if ("unit" in updates) delete next.unit;
            if ("price" in updates) delete next.price;
            if ("supplier" in updates) delete next.supplier;
            if ("notes" in updates) delete next.notes;
            return next;
          });
        }}
        onSave={saveMaterial}
      />
    </div>
  );
}
