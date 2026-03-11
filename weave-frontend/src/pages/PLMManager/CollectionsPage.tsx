import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Archive,
  CalendarClock,
  Eye,
  FolderKanban,
  ImagePlus,
  Package2,
  Pencil,
  Ruler,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { TableToolbar } from "../../components/ui/TableToolbar";
import Pagination from "../../components/ui/Pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import SecondaryButton from "../../components/ui/SecondaryButton";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import DetailsModal from "../../components/ui/DetailsModal";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import { collectionsApi } from "../../lib/api/collectionsApi";
import { materialsApi, type Material } from "../../lib/api/materialsApi";
import { bomApi } from "../../lib/api/bomApi";
import {
  createDefaultSizeMatrix,
  hydrateProducts,
  loadProducts,
  saveProducts,
  type ProductRecord,
  type ProductStatus,
  type SizeKey,
  type SizeMatrix,
} from "../../lib/productStorage";
import { productsApi } from "../../lib/api/productsApi";
import { uploadProductImageToCloudinary } from "../../lib/api/cloudinaryApi";

type CollectionRecord = {
  id: number;
  code: string;
  name: string;
  season: string;
  launchDate: string;
  notes: string;
};

type CollectionFormData = {
  code: string;
  name: string;
  season: string;
  launchDate: string;
  notes: string;
};

type ProductFormData = {
  sku: string;
  name: string;
  category: string;
  quantity: string;
  collection: string;
  season: string;
  sizeProfile: string;
  status: ProductStatus;
  designPhoto: string;
  sizeMatrix: SizeMatrix;
  designNotes: string;
  instructions: string;
};

type CollectionFieldErrors = Partial<Record<"code" | "name" | "season" | "launchDate" | "notes", string>>;
type ProductFieldErrors = Partial<Record<"sku" | "name" | "category" | "quantity" | "designPhoto" | "season" | "designNotes" | "instructions", string>>;
type BomFieldErrors = Partial<Record<"materialId" | "qty" | "unit" | "materials", string>>;

type BOMLineDraft = {
  materialId: number;
  materialName: string;
  category: string;
  unitCost: number;
  qty: number;
  unit: string;
};
type ProductBOMStatus = "Pending BOM" | "Completed BOM";
type BOMRecord = {
  BOMID: number;
  ProductID: number;
  MaterialName: string;
  QtyRequired: number;
  Unit: string;
  UnitCost: number;
};

type ConfirmationAction = "archive";
type CollectionSaveMode = "create" | "update";

type ConfirmationState = {
  isOpen: boolean;
  action: ConfirmationAction | null;
  productId?: string;
  title: string;
  message: string;
  variant: "primary" | "danger";
  confirmText: string;
  reopenProductModalOnCancel?: boolean;
};

const emptyForm: CollectionFormData = {
  code: "",
  name: "",
  season: "",
  launchDate: "",
  notes: "",
};

const CATEGORY_OPTIONS = [
  "T-Shirts",
  "Shirts / Blouses",
  "Pants / Trousers",
  "Jeans / Denim",
  "Shorts",
  "Dresses",
  "Skirts",
  "Jackets / Outerwear",
  "Activewear / Sportswear",
  "Sleepwear / Loungewear",
];

const UNIT_OPTIONS = ["cm", "inch", "yard", "meter", "foot"];

const emptyProductForm: ProductFormData = {
  sku: "",
  name: "",
  category: "",
  quantity: "1",
  collection: "",
  season: "",
  sizeProfile: "",
  status: "Draft",
  designPhoto: "",
  sizeMatrix: createDefaultSizeMatrix(),
  designNotes: "",
  instructions: "",
};

function AddEditCollectionModal({
  isOpen,
  isEditing,
  formData,
  fieldErrors,
  formError,
  onClose,
  onChange,
  onSave,
}: {
  isOpen: boolean;
  isEditing: boolean;
  formData: CollectionFormData;
  fieldErrors: CollectionFieldErrors;
  formError: string;
  onClose: () => void;
  onChange: (updates: Partial<CollectionFormData>) => void;
  onSave: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 px-6 py-5">
          <h3 className="text-lg font-semibold text-slate-900">{isEditing ? "Edit Collection" : "Add Collection"}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Manage collection metadata before product setup and submission.
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Required: Collection code, name, season, and target launch date
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Collection Code</Label>
            <Input
              value={formData.code}
              onChange={(e) => onChange({ code: e.target.value })}
              placeholder="e.g. SS26-WF-CORE"
              className={fieldErrors.code ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.code ? <p className="text-xs text-rose-600">{fieldErrors.code}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Collection Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Spring Summer 2026 Core"
              className={fieldErrors.name ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.name ? <p className="text-xs text-rose-600">{fieldErrors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Input
              value={formData.season}
              onChange={(e) => onChange({ season: e.target.value })}
              placeholder="Spring / Summer 2026"
              className={fieldErrors.season ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.season ? <p className="text-xs text-rose-600">{fieldErrors.season}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Target Launch Date</Label>
            <Input
              type="date"
              value={formData.launchDate}
              onChange={(e) => onChange({ launchDate: e.target.value })}
              className={fieldErrors.launchDate ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.launchDate ? <p className="text-xs text-rose-600">{fieldErrors.launchDate}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="Collection brief, positioning, and revision notes..."
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

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onSave} className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs">
            {isEditing ? "Save Changes" : "Create Collection"}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AddEditProductModal({
  isOpen,
  isEditing,
  isSaving,
  errorMessage,
  fieldErrors,
  formData,
  designPreviewUrl,
  onClose,
  onChange,
  onPhotoSelect,
  onSave,
}: {
  isOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  errorMessage: string;
  fieldErrors: ProductFieldErrors;
  formData: ProductFormData;
  designPreviewUrl: string;
  onClose: () => void;
  onChange: (updates: Partial<ProductFormData>) => void;
  onPhotoSelect: (file: File | null) => void;
  onSave: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">{isEditing ? "Edit Product" : "Add Product"}</h3>
          <p className="text-xs text-slate-500">Manage product setup, size matrix only, and design media.</p>
        </div>

        <div className="grid gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Base SKU</Label>
            <Input
              value={formData.sku}
              onChange={(e) => onChange({ sku: e.target.value })}
              placeholder="WF-SHRT-2601"
              className={fieldErrors.sku ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.sku ? <p className="text-xs text-rose-600">{fieldErrors.sku}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Structured Polo Shirt"
              className={fieldErrors.name ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.name ? <p className="text-xs text-rose-600">{fieldErrors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Collection</Label>
            <Input value={formData.collection} readOnly placeholder="Collection from details modal" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => onChange({ category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.category ? <p className="text-xs text-rose-600">{fieldErrors.category}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={formData.quantity}
              onChange={(e) => onChange({ quantity: e.target.value })}
              placeholder="1"
              className={fieldErrors.quantity ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.quantity ? <p className="text-xs text-rose-600">{fieldErrors.quantity}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Input
              value={formData.season}
              readOnly
              placeholder="Season from selected collection"
              className={fieldErrors.season ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.season ? <p className="text-xs text-rose-600">{fieldErrors.season}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Import Design Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onPhotoSelect(file);
                if (!file) {
                  onChange({ designPhoto: "" });
                  return;
                }
                onChange({ designPhoto: file.name });
              }}
            />
            <p className="text-xs text-slate-500">
              {formData.designPhoto
                ? formData.designPhoto.startsWith("data:image")
                  ? "Image uploaded."
                  : formData.designPhoto
                : "No file selected."}
            </p>
            {fieldErrors.designPhoto ? <p className="text-xs text-rose-600">{fieldErrors.designPhoto}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Design</Label>
            {designPreviewUrl ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                <img
                  src={designPreviewUrl}
                  alt="Selected design preview"
                  crossOrigin={designPreviewUrl.startsWith("http") ? "anonymous" : undefined}
                  referrerPolicy={designPreviewUrl.startsWith("http") ? "no-referrer" : undefined}
                  className="h-48 w-full rounded-lg bg-slate-50 object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Select a design photo to preview it here.
              </div>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Design Notes</Label>
            <Textarea
              value={formData.designNotes}
              onChange={(e) => onChange({ designNotes: e.target.value })}
              placeholder="Design silhouette, trims, and fit details..."
              className={fieldErrors.designNotes ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.designNotes ? <p className="text-xs text-rose-600">{fieldErrors.designNotes}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Manufacturing Instructions</Label>
            <Textarea
              value={formData.instructions}
              onChange={(e) => onChange({ instructions: e.target.value })}
              placeholder="Cutting, stitching, and finishing instructions..."
              className={fieldErrors.instructions ? "border-rose-300 focus-visible:ring-rose-300" : ""}
            />
            {fieldErrors.instructions ? <p className="text-xs text-rose-600">{fieldErrors.instructions}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Size Matrix Only</Label>
            <div className="space-y-2 rounded-xl border border-slate-200 p-3">
              {(["S", "M", "L", "XL", "XXL"] as SizeKey[]).map((size) => (
                <div key={size} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                  <div className="text-sm font-medium text-slate-700">Size {size}</div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Unit</Label>
                    <Select
                      value={formData.sizeMatrix[size].measurementType || "cm"}
                      onValueChange={(value) =>
                        onChange({
                          sizeMatrix: {
                            ...formData.sizeMatrix,
                            [size]: { ...formData.sizeMatrix[size], measurementType: value },
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {!UNIT_OPTIONS.includes(formData.sizeMatrix[size].measurementType) &&
                        formData.sizeMatrix[size].measurementType ? (
                          <SelectItem value={formData.sizeMatrix[size].measurementType}>
                            {formData.sizeMatrix[size].measurementType}
                          </SelectItem>
                        ) : null}
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder={`Chest (${formData.sizeMatrix[size].measurementType || "cm"})`}
                    value={formData.sizeMatrix[size].chest}
                    onChange={(e) =>
                      onChange({
                        sizeMatrix: {
                          ...formData.sizeMatrix,
                          [size]: { ...formData.sizeMatrix[size], chest: e.target.value },
                        },
                      })
                    }
                  />
                  <Input
                    placeholder={`Neck (${formData.sizeMatrix[size].measurementType || "cm"})`}
                    value={formData.sizeMatrix[size].neck}
                    onChange={(e) =>
                      onChange({
                        sizeMatrix: {
                          ...formData.sizeMatrix,
                          [size]: { ...formData.sizeMatrix[size], neck: e.target.value },
                        },
                      })
                    }
                  />
                  <Input
                    placeholder={`Shoulder Width (${formData.sizeMatrix[size].measurementType || "cm"})`}
                    value={formData.sizeMatrix[size].shoulderWidth}
                    onChange={(e) =>
                      onChange({
                        sizeMatrix: {
                          ...formData.sizeMatrix,
                          [size]: { ...formData.sizeMatrix[size], shoulderWidth: e.target.value },
                        },
                      })
                    }
                  />
                  <Input
                    placeholder={`Sleeve Length (${formData.sizeMatrix[size].measurementType || "cm"})`}
                    value={formData.sizeMatrix[size].sleeveLength}
                    onChange={(e) =>
                      onChange({
                        sizeMatrix: {
                          ...formData.sizeMatrix,
                          [size]: { ...formData.sizeMatrix[size], sleeveLength: e.target.value },
                        },
                      })
                    }
                  />
                  <Input
                    placeholder={`Overall Body Length (${formData.sizeMatrix[size].measurementType || "cm"})`}
                    value={formData.sizeMatrix[size].overallBodyLength}
                    onChange={(e) =>
                      onChange({
                        sizeMatrix: {
                          ...formData.sizeMatrix,
                          [size]: { ...formData.sizeMatrix[size], overallBodyLength: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          {errorMessage ? (
            <p className="sm:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <SecondaryButton onClick={onClose} disabled={isSaving}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={onSave} className="!w-auto !rounded-full !px-5 !py-2.5 !text-xs" disabled={isSaving}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AddBOMModal({
  isOpen,
  collectionName,
  productName,
  materials,
  addedMaterials,
  formData,
  fieldErrors,
  formError,
  onClose,
  onChange,
  onAddMaterial,
  onRemoveMaterial,
  onSave,
}: {
  isOpen: boolean;
  collectionName: string;
  productName: string;
  materials: Array<{ id: number; name: string; category: string; unit: string; unitCost: number }>;
  addedMaterials: BOMLineDraft[];
  formData: { materialId: string; qty: string; unit: string };
  fieldErrors: BomFieldErrors;
  formError: string;
  onClose: () => void;
  onChange: (updates: Partial<{ materialId: string; qty: string; unit: string }>) => void;
  onAddMaterial: () => void;
  onRemoveMaterial: (materialId: number) => void;
  onSave: () => void;
}) {
  if (!isOpen) return null;

  const BOM_UNIT_OPTIONS = [
    "meters",
    "yards",
    "centimeters",
    "millimeters",
    "inch",
    "roll",
    "spool",
    "cone",
    "piece",
    "set",
    "pair",
    "pack",
    "bundle",
    "box",
    "bag",
    "sheet",
    "dozen",
    "gross",
  ];

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">Add BOM</h3>
          <p className="text-xs text-slate-500">Create a BOM line for the selected collection product.</p>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Collection</Label>
            <Input value={collectionName} disabled />
          </div>
          <div className="space-y-2">
            <Label>Product</Label>
            <Input value={productName} disabled />
          </div>
          <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-800">Materials Section (Multiple Materials)</p>
              <p className="text-xs text-slate-500">
                Add one material at a time using Material + Quantity + Unit, then click Add Material to build the BOM list.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Material</Label>
                <Select
                  value={formData.materialId}
                  onValueChange={(value) => {
                    const selected = materials.find((item) => String(item.id) === value);
                    onChange({ materialId: value, unit: selected?.unit ?? formData.unit });
                  }}
                >
                  <SelectTrigger className={fieldErrors.materialId ? "border-rose-300" : ""}>
                    <SelectValue placeholder="Select material (with price)" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name} ({item.category}) - PHP {item.unitCost.toFixed(2)} / {item.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.materialId ? <p className="text-xs text-rose-600">{fieldErrors.materialId}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  value={formData.qty}
                  onChange={(e) => onChange({ qty: e.target.value })}
                  placeholder="e.g. 2.4"
                  className={fieldErrors.qty ? "border-rose-300 focus-visible:ring-rose-300" : ""}
                />
                {fieldErrors.qty ? <p className="text-xs text-rose-600">{fieldErrors.qty}</p> : null}
              </div>

              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => onChange({ unit: value })}>
                  <SelectTrigger className={fieldErrors.unit ? "border-rose-300" : ""}>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOM_UNIT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.unit ? <p className="text-xs text-rose-600">{fieldErrors.unit}</p> : null}
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <SecondaryButton onClick={onAddMaterial} className="!rounded-full !px-4 !py-2 !text-xs">
                  Add Material
                </SecondaryButton>
              </div>

              <div className="sm:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-16 text-right">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addedMaterials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-xs text-slate-500">
                          No materials added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      addedMaterials.map((item) => (
                        <TableRow key={item.materialId}>
                          <TableCell className="font-medium text-slate-700">{item.materialName}</TableCell>
                          <TableCell>{item.category || "-"}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>PHP {item.unitCost.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <SecondaryButton
                              icon={Trash2}
                              className="!rounded-lg !px-2 !py-2"
                              ariaLabel={`Remove ${item.materialName}`}
                              onClick={() => onRemoveMaterial(item.materialId)}
                            >
                              <span className="sr-only">Remove</span>
                            </SecondaryButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {fieldErrors.materials ? <p className="mt-2 text-xs text-rose-600">{fieldErrors.materials}</p> : null}
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
            Add BOM
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ViewBOMModal({
  isOpen,
  collectionName,
  productName,
  lines,
  onClose,
  onAddBOM,
}: {
  isOpen: boolean;
  collectionName: string;
  productName: string;
  lines: BOMRecord[];
  onClose: () => void;
  onAddBOM: () => void;
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">View BOM</h3>
            <p className="text-xs text-slate-500">Review BOM materials for this product and add more if needed.</p>
          </div>
          <button
            aria-label="Close BOM"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Collection</Label>
              <Input value={collectionName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Product</Label>
              <Input value={productName} disabled />
            </div>
          </div>

          {lines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">No BOM added yet.</p>
              <p className="mt-1 text-xs text-slate-500">Add BOM now to include one or more materials with quantity and unit.</p>
              <div className="mt-3">
                <PrimaryButton onClick={onAddBOM} className="!w-auto !rounded-full !px-4 !py-2 !text-xs">
                  Add BOM
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <SecondaryButton onClick={onAddBOM} className="!rounded-full !px-4 !py-2 !text-xs">
                  Add BOM
                </SecondaryButton>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.BOMID}>
                        <TableCell className="font-medium text-slate-700">{line.MaterialName}</TableCell>
                        <TableCell>{line.QtyRequired}</TableCell>
                        <TableCell>{line.Unit}</TableCell>
                        <TableCell>PHP {Number(line.UnitCost ?? 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function CollectionsPage() {
  const [searchParams] = useSearchParams();
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>(() => loadProducts());
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsCollection, setDetailsCollection] = useState<CollectionRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CollectionFormData>(emptyForm);
  const [collectionFieldErrors, setCollectionFieldErrors] = useState<CollectionFieldErrors>({});
  const [collectionFormError, setCollectionFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isProductFilterOpen, setIsProductFilterOpen] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productDateFilter, setProductDateFilter] = useState("");
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [detailsProduct, setDetailsProduct] = useState<ProductRecord | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<ProductFormData>(emptyProductForm);
  const [designPreviewUrl, setDesignPreviewUrl] = useState("");
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState("");
  const [productFieldErrors, setProductFieldErrors] = useState<ProductFieldErrors>({});
  const [materialOptions, setMaterialOptions] = useState<
    Array<{ id: number; name: string; category: string; unit: string; unitCost: number }>
  >([]);
  const [bomRecords, setBomRecords] = useState<BOMRecord[]>([]);
  const [selectedViewBOMProduct, setSelectedViewBOMProduct] = useState<ProductRecord | null>(null);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [selectedBOMProduct, setSelectedBOMProduct] = useState<ProductRecord | null>(null);
  const [bomFormData, setBomFormData] = useState<{ materialId: string; qty: string; unit: string }>({
    materialId: "",
    qty: "",
    unit: "",
  });
  const [bomLines, setBomLines] = useState<BOMLineDraft[]>([]);
  const [bomFieldErrors, setBomFieldErrors] = useState<BomFieldErrors>({});
  const [bomFormError, setBomFormError] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    action: null,
    title: "",
    message: "",
    variant: "primary",
    confirmText: "Confirm",
  });
  const [toastState, setToastState] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pendingCollectionSaveMode, setPendingCollectionSaveMode] = useState<CollectionSaveMode | null>(null);

  const toDateInput = (value?: string): string => {
    if (!value) return "";
    return value.includes("T") ? value.split("T")[0] : value;
  };

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await collectionsApi.list();
      setCollections(
        data.map((item) => ({
          id: item.CollectionID,
          code: item.CollectionCode,
          name: item.CollectionName,
          season: item.Season,
          launchDate: toDateInput(item.TargetLaunchDate),
          notes: item.Notes || "",
        })),
      );
    } catch {
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBOMRecords = async () => {
    try {
      const rows = await bomApi.list();
      setBomRecords(Array.isArray(rows) ? (rows as BOMRecord[]) : []);
    } catch {
      setBomRecords([]);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  useEffect(() => {
    const rawCollectionId = searchParams.get("collectionId");
    if (!rawCollectionId) return;
    const numericId = Number(rawCollectionId);
    if (!Number.isFinite(numericId) || numericId <= 0) return;
    const target = collections.find((item) => item.id === numericId);
    if (!target) return;
    setDetailsCollection(target);
  }, [collections, searchParams]);

  useEffect(() => {
    hydrateProducts().then(setProducts).catch(() => undefined);
  }, []);

  useEffect(() => {
    void loadBOMRecords();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const materials = await materialsApi.list();
        setMaterialOptions(
          materials
            .filter((item: Material) => String(item.Status ?? "").toLowerCase() !== "archived")
            .map((item: Material) => ({
              id: item.MaterialID,
              name: item.Name,
              category: item.Type,
              unit: item.Unit,
              unitCost: Number(item.UnitCost ?? 0),
            })),
        );
      } catch {
        setMaterialOptions([]);
      }
    })();
  }, []);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const filteredCollections = useMemo(
    () =>
      collections.filter((item) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          item.code.toLowerCase().includes(query) ||
          item.name.toLowerCase().includes(query) ||
          item.season.toLowerCase().includes(query);
        return matchesQuery;
      }),
    [collections, searchQuery],
  );

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredCollections.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCollections.length);
  const pagedCollections = filteredCollections.slice(startIndex, endIndex);

  const hasCollectionFieldErrors = (errors: CollectionFieldErrors) => Object.values(errors).some(Boolean);
  const hasProductFieldErrors = (errors: ProductFieldErrors) => Object.values(errors).some(Boolean);

  const validateCollectionForm = (values: CollectionFormData): CollectionFieldErrors => {
    const errors: CollectionFieldErrors = {};
    if (!values.code.trim()) errors.code = "Collection code is required.";
    else if (values.code.trim().length > 50) errors.code = "Collection code must be at most 50 characters.";

    if (!values.name.trim()) errors.name = "Collection name is required.";
    else if (values.name.trim().length > 160) errors.name = "Collection name must be at most 160 characters.";

    if (!values.season.trim()) errors.season = "Season is required.";
    else if (values.season.trim().length > 60) errors.season = "Season must be at most 60 characters.";

    if (!values.launchDate.trim()) errors.launchDate = "Target launch date is required.";
    if (values.notes.trim().length > 1000) errors.notes = "Notes must be at most 1000 characters.";
    return errors;
  };

  const validateProductForm = (values: ProductFormData, derivedSeason: string): ProductFieldErrors => {
    const errors: ProductFieldErrors = {};
    if (!values.sku.trim()) errors.sku = "SKU is required.";
    else if (values.sku.trim().length > 80) errors.sku = "SKU must be at most 80 characters.";

    if (!values.name.trim()) errors.name = "Product name is required.";
    else if (values.name.trim().length > 180) errors.name = "Product name must be at most 180 characters.";

    if (!values.category.trim()) errors.category = "Category is required.";
    else if (values.category.trim().length > 80) errors.category = "Category must be at most 80 characters.";

    const quantity = Number(values.quantity);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
      errors.quantity = "Quantity must be a whole number greater than zero.";
    }

    const imageValue = values.designPhoto.trim();
    if (imageValue && !imageValue.startsWith("data:image") && imageValue.length > 500) {
      errors.designPhoto = "Image URL must be at most 500 characters.";
    }

    if (!values.designNotes.trim()) errors.designNotes = "Design notes is required.";
    if (!values.instructions.trim()) errors.instructions = "Manufacturing instructions is required.";

    if (!String(derivedSeason).trim()) errors.season = "Season is required.";
    else if (String(derivedSeason).trim().length > 80) errors.season = "Season must be at most 80 characters.";
    return errors;
  };

  const normalizeValidationErrors = (raw?: Record<string, string[] | string>): Record<string, string> => {
    if (!raw) return {};
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      const first = (Array.isArray(value) ? value : [value]).find(
        (entry) => typeof entry === "string" && entry.trim().length > 0,
      );
      if (first) {
        normalized[key.toLowerCase()] = first;
      }
    }
    return normalized;
  };

  const mapCollectionValidationErrors = (raw?: Record<string, string[] | string>): CollectionFieldErrors => {
    const normalized = normalizeValidationErrors(raw);
    const mapped: CollectionFieldErrors = {};
    for (const [key, value] of Object.entries(normalized)) {
      if (key.includes("collectioncode") || key === "code") mapped.code = value;
      else if (key.includes("collectionname") || key === "name") mapped.name = value;
      else if (key.includes("season")) mapped.season = value;
      else if (key.includes("targetlaunchdate") || key.includes("launchdate")) mapped.launchDate = value;
      else if (key.includes("notes")) mapped.notes = value;
    }
    return mapped;
  };

  const mapProductValidationErrors = (raw?: Record<string, string[] | string>): ProductFieldErrors => {
    const normalized = normalizeValidationErrors(raw);
    const mapped: ProductFieldErrors = {};
    for (const [key, value] of Object.entries(normalized)) {
      if (key.includes("sku")) mapped.sku = value;
      else if (key === "name" || key.includes("productname")) mapped.name = value;
      else if (key.includes("category")) mapped.category = value;
      else if (key.includes("quantity")) mapped.quantity = value;
      else if (key.includes("imageurl") || key.includes("designphoto")) mapped.designPhoto = value;
      else if (key.includes("designnotes")) mapped.designNotes = value;
      else if (key.includes("manufacturinginstructions") || key.includes("instructions")) mapped.instructions = value;
      else if (key.includes("season")) mapped.season = value;
    }
    return mapped;
  };

  const clearDesignPreview = () => {
    if (designPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(designPreviewUrl);
    }
    setDesignPreviewUrl("");
  };

  useEffect(() => {
    return () => {
      if (designPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(designPreviewUrl);
      }
    };
  }, [designPreviewUrl]);

  const selectedCollectionName = detailsCollection?.name.trim().toLowerCase() ?? "";
  const selectedCollectionSeason = detailsCollection?.season.trim().toLowerCase() ?? "";

  const toNumericProductId = (value: string): number =>
    Number(value) || Number(String(value).replace(/[^\d]/g, ""));

  const bomByProductId = useMemo(() => {
    const map = new Map<number, BOMRecord[]>();
    for (const line of bomRecords) {
      const key = Number(line.ProductID);
      if (!Number.isFinite(key) || key <= 0) continue;
      const bucket = map.get(key);
      if (bucket) bucket.push(line);
      else map.set(key, [line]);
    }
    return map;
  }, [bomRecords]);

  const getProductBOMStatus = (product: ProductRecord): ProductBOMStatus => {
    const id = toNumericProductId(product.id);
    if (!Number.isFinite(id) || id <= 0) return "Pending BOM";
    return (bomByProductId.get(id)?.length ?? 0) > 0 ? "Completed BOM" : "Pending BOM";
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        const status = String(item.status ?? "").toLowerCase();
        if (status === "archived") {
          return false;
        }

        const productCollection = String(item.collection ?? "").trim().toLowerCase();
        const productSeason = String(item.season ?? "").trim().toLowerCase();
        const inSelectedCollection =
          selectedCollectionName.length === 0
            ? true
            : productCollection === selectedCollectionName ||
              (selectedCollectionSeason.length > 0 && productSeason === selectedCollectionSeason) ||
              (selectedCollectionSeason.length > 0 && productCollection === selectedCollectionSeason);
        if (!inSelectedCollection) {
          return false;
        }

        const query = productSearchQuery.toLowerCase();
        const matchesQuery =
          String(item.sku ?? "").toLowerCase().includes(query) ||
          String(item.name ?? "").toLowerCase().includes(query) ||
          String(item.category ?? "").toLowerCase().includes(query) ||
          String(item.collection ?? "").toLowerCase().includes(query) ||
          String(item.sizeProfile ?? "").toLowerCase().includes(query);
        const bomStatus = getProductBOMStatus(item).toLowerCase();
        const matchesStatus = productStatusFilter === "all" || bomStatus === productStatusFilter.toLowerCase();
        const normalizedLastUpdated = toDateInput(String(item.lastUpdated ?? ""));
        const matchesDate = !productDateFilter || normalizedLastUpdated === productDateFilter;
        return matchesQuery && matchesStatus && matchesDate;
      }),
    [
      products,
      selectedCollectionName,
      selectedCollectionSeason,
      productSearchQuery,
      productStatusFilter,
      productDateFilter,
      bomByProductId,
    ],
  );

  const productItemsPerPage = 6;
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / productItemsPerPage));
  const productSafePage = Math.min(productCurrentPage, productTotalPages);
  const productStartIndex = (productSafePage - 1) * productItemsPerPage;
  const productEndIndex = Math.min(productStartIndex + productItemsPerPage, filteredProducts.length);
  const pagedProducts = filteredProducts.slice(productStartIndex, productEndIndex);

  const selectedDesignPhoto = String(detailsProduct?.designPhoto ?? "").trim();
  const canPreviewDesignPhoto =
    selectedDesignPhoto.startsWith("http://") ||
    selectedDesignPhoto.startsWith("https://") ||
    selectedDesignPhoto.startsWith("data:image");

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setCollectionFieldErrors({});
    setCollectionFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (record: CollectionRecord) => {
    setEditingId(record.id);
    setFormData({
      code: record.code,
      name: record.name,
      season: record.season,
      launchDate: record.launchDate,
      notes: record.notes,
    });
    setCollectionFieldErrors({});
    setCollectionFormError("");
    setIsModalOpen(true);
  };

  const requestSaveCollection = () => {
    const clientErrors = validateCollectionForm(formData);
    setCollectionFieldErrors(clientErrors);
    setCollectionFormError("");
    if (hasCollectionFieldErrors(clientErrors)) return;
    const mode: CollectionSaveMode = editingId ? "update" : "create";
    setPendingCollectionSaveMode(mode);
    setConfirmation({
      isOpen: true,
      action: "archive",
      title: mode === "update" ? "Confirm Save Changes" : "Confirm Create Collection",
      message:
        mode === "update"
          ? "Apply these updates to the selected collection?"
          : "Create this collection with the provided details?",
      variant: "primary",
      confirmText: mode === "update" ? "Save Changes" : "Create Collection",
      reopenProductModalOnCancel: false,
    });
  };

  const saveCollection = async () => {
    try {
      if (editingId) {
        await collectionsApi.update(editingId, {
          CollectionCode: formData.code.trim(),
          CollectionName: formData.name.trim(),
          Season: formData.season.trim(),
          TargetLaunchDate: formData.launchDate,
          Notes: formData.notes.trim() || undefined,
        });
      } else {
        await collectionsApi.create({
          CollectionCode: formData.code.trim(),
          CollectionName: formData.name.trim(),
          Season: formData.season.trim(),
          TargetLaunchDate: formData.launchDate,
          Notes: formData.notes.trim() || undefined,
        });
      }

      await loadCollections();
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      setCollectionFieldErrors({});
      setCollectionFormError("");
      setToastState({
        type: "success",
        message: pendingCollectionSaveMode === "update" ? "Collection updated successfully." : "Collection created successfully.",
      });
    } catch (error) {
      const validationErrors =
        typeof error === "object" && error !== null && "validationErrors" in error
          ? (error as { validationErrors?: Record<string, string[] | string> }).validationErrors
          : undefined;
      const mapped = mapCollectionValidationErrors(validationErrors);
      setCollectionFieldErrors(mapped);
      const firstValidationMessage = Object.values(mapped).find(Boolean);
      const message =
        firstValidationMessage ||
        (error instanceof Error ? error.message : "Failed to save collection.");
      setCollectionFormError(message);
      setToastState({ type: "error", message });
    } finally {
      setPendingCollectionSaveMode(null);
    }
  };

  const archiveCollection = (id: number) => {
    void (async () => {
      await collectionsApi.archive(id);
      await loadCollections();
    })();
  };

  const resetCollectionWorkflowToDraft = async () => {
    const collectionId = detailsCollection?.id;
    if (!collectionId) return;
    try {
      await collectionsApi.update(collectionId, { Status: "Draft" });
    } catch {
      // Non-blocking reset: product/BOM save should still succeed if reset fails.
    }
  };

  const openAddBOMModal = (product: ProductRecord) => {
    setSelectedBOMProduct(product);
    setBomFormData({ materialId: "", qty: "", unit: "" });
    setBomLines([]);
    setBomFieldErrors({});
    setBomFormError("");
    setIsBOMModalOpen(true);
  };

  const openViewBOMModal = (product: ProductRecord) => {
    setSelectedViewBOMProduct(product);
  };

  const validateBOMForm = (values: { materialId: string; qty: string; unit: string }): BomFieldErrors => {
    const errors: BomFieldErrors = {};
    if (!values.materialId.trim()) errors.materialId = "Material is required.";
    if (!values.qty.trim()) errors.qty = "Quantity is required.";
    else {
      const qty = Number(values.qty);
      if (!Number.isFinite(qty) || qty <= 0) errors.qty = "Quantity must be greater than 0.";
    }
    if (!values.unit.trim()) errors.unit = "Unit is required.";
    else if (values.unit.trim().length > 20) errors.unit = "Unit must be at most 20 characters.";
    return errors;
  };

  const addMaterialToBOM = () => {
    const errors = validateBOMForm(bomFormData);
    setBomFieldErrors(errors);
    setBomFormError("");
    if (Object.values(errors).some(Boolean)) return;

    const selectedMaterial = materialOptions.find((item) => String(item.id) === bomFormData.materialId);
    if (!selectedMaterial) {
      setBomFormError("Selected material is invalid.");
      return;
    }

    setBomLines((prev) => {
      if (prev.some((entry) => entry.materialId === selectedMaterial.id)) {
        setBomFormError("Material already added to the list.");
        return prev;
      }

      return [
        ...prev,
        {
          materialId: selectedMaterial.id,
          materialName: selectedMaterial.name,
          category: selectedMaterial.category,
          unitCost: Number(selectedMaterial.unitCost),
          qty: Number(bomFormData.qty),
          unit: bomFormData.unit.trim(),
        },
      ];
    });

    setBomFormData({ materialId: "", qty: "", unit: "" });
    setBomFieldErrors({});
  };

  const removeMaterialFromBOM = (materialId: number) => {
    setBomLines((prev) => prev.filter((item) => item.materialId !== materialId));
    setBomFieldErrors((prev) => {
      const next = { ...prev };
      delete next.materials;
      return next;
    });
  };

  const saveBOMLine = () => {
    if (!selectedBOMProduct) return;
    setBomFormError("");
    if (bomLines.length === 0) {
      setBomFieldErrors({ materials: "Add at least one material before saving BOM." });
      return;
    }

    const productId =
      Number(selectedBOMProduct.id) ||
      Number(String(selectedBOMProduct.id).replace(/[^\d]/g, ""));
    if (!Number.isFinite(productId) || productId <= 0) {
      setBomFormError("Selected product is invalid.");
      return;
    }

    void (async () => {
      try {
        for (const line of bomLines) {
          await bomApi.create({
            ProductID: productId,
            MaterialName: line.materialName,
            QtyRequired: line.qty,
            Unit: line.unit,
            UnitCost: Number(line.unitCost),
          });
        }
        await resetCollectionWorkflowToDraft();
        setIsBOMModalOpen(false);
        setSelectedBOMProduct(null);
        setBomFormData({ materialId: "", qty: "", unit: "" });
        setBomLines([]);
        await loadBOMRecords();
        setToastState({ type: "success", message: `BOM with ${bomLines.length} material(s) added for ${selectedBOMProduct.name}.` });
      } catch (error) {
        setBomFormError(error instanceof Error ? error.message : "Failed to add BOM.");
      }
    })();
  };

  const handlePhotoSelect = (file: File | null) => {
    setSelectedPhotoFile(file);
    if (designPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(designPreviewUrl);
    }
    if (!file) {
      setDesignPreviewUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setDesignPreviewUrl(nextUrl);
  };

  const openCollectionDetails = (collection: CollectionRecord) => {
    setDetailsCollection(collection);
    setProductSearchQuery("");
    setProductStatusFilter("all");
    setProductDateFilter("");
    setProductCurrentPage(1);
    setIsProductFilterOpen(false);
  };

  const openAddProductModal = () => {
    if (!detailsCollection) return;
    setEditingProductId(null);
    setProductFormError("");
    setProductFieldErrors({});
    setSelectedPhotoFile(null);
    setProductFormData({
      ...emptyProductForm,
      category: CATEGORY_OPTIONS[0],
      quantity: "1",
      collection: detailsCollection.name,
      season: detailsCollection.season,
      sizeProfile: "S/M/L/XL/XXL",
      status: "Draft",
      sizeMatrix: createDefaultSizeMatrix(),
    });
    clearDesignPreview();
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (record: ProductRecord) => {
    setEditingProductId(record.id);
    setProductFormError("");
    setProductFieldErrors({});
    setSelectedPhotoFile(null);
    setProductFormData({
      sku: record.sku,
      name: record.name,
      category: record.category || CATEGORY_OPTIONS[0],
      quantity: String(record.quantity ?? 1),
      collection: detailsCollection?.name || record.collection,
      season: detailsCollection?.season || record.season,
      sizeProfile: record.sizeProfile || "S/M/L/XL/XXL",
      status: (record.status as ProductStatus) || "Draft",
      designPhoto: record.designPhoto,
      sizeMatrix: record.sizeMatrix,
      designNotes: record.designNotes,
      instructions: record.instructions,
    });
    clearDesignPreview();
    if (record.designPhoto.startsWith("data:image") || record.designPhoto.startsWith("http")) {
      setDesignPreviewUrl(record.designPhoto);
    }
    setIsProductModalOpen(true);
  };

  const saveProduct = async (): Promise<boolean> => {
    const derivedSeason = productFormData.season.trim() || detailsCollection?.season || "General";
    const clientErrors = validateProductForm(productFormData, derivedSeason);
    setProductFieldErrors(clientErrors);
    setProductFormError("");
    if (hasProductFieldErrors(clientErrors)) {
      return false;
    }

    setIsSavingProduct(true);
    setProductFormError("");

    try {
      let imageUrl = productFormData.designPhoto.trim();
      if (selectedPhotoFile) {
        imageUrl = await uploadProductImageToCloudinary(selectedPhotoFile);
      }

      const payload = {
        SKU: productFormData.sku.trim(),
        Name: productFormData.name.trim(),
        Category: productFormData.category.trim(),
        Quantity: Number(productFormData.quantity),
        ImageUrl: imageUrl || undefined,
        Status: productFormData.status || "Draft",
        DesignNotes: productFormData.designNotes.trim(),
        ManufacturingInstructions: productFormData.instructions.trim(),
        SizeProfile: JSON.stringify(productFormData.sizeMatrix),
        Season: derivedSeason,
      };

      if (editingProductId) {
        const id = Number(editingProductId);
        if (!Number.isFinite(id)) {
          throw new Error("Invalid product ID for update.");
        }
        await productsApi.update(id, payload);
      } else {
        await productsApi.create(payload);
        await resetCollectionWorkflowToDraft();
      }

      const refreshed = await hydrateProducts();
      setProducts(refreshed);
      setIsProductModalOpen(false);
      setEditingProductId(null);
      setSelectedPhotoFile(null);
      clearDesignPreview();
      setProductFormData({ ...emptyProductForm, sizeMatrix: createDefaultSizeMatrix() });
      setProductFieldErrors({});
      return true;
    } catch (error) {
      const validationErrors =
        typeof error === "object" && error !== null && "validationErrors" in error
          ? (error as { validationErrors?: Record<string, string[] | string> }).validationErrors
          : undefined;
      const mapped = mapProductValidationErrors(validationErrors);
      setProductFieldErrors(mapped);
      const firstValidationMessage = Object.values(mapped).find(Boolean);
      const message =
        firstValidationMessage ||
        (error instanceof Error ? error.message : "Failed to save product.");
      setProductFormError(message);
      return false;
    } finally {
      setIsSavingProduct(false);
    }
  };

  const archiveProduct = async (id: string) => {
    try {
      const numericId = Number(id);
      if (!Number.isFinite(numericId)) {
        throw new Error("Invalid product ID for archive.");
      }
      await productsApi.archive(numericId);
      const refreshed = await hydrateProducts();
      setProducts(refreshed);
      return true;
    } catch {
      return false;
    }
  };

  const closeConfirmation = (options?: { reopenProductModal?: boolean }) => {
    const shouldReopenProductModal =
      options?.reopenProductModal ?? Boolean(confirmation.reopenProductModalOnCancel);
    setPendingCollectionSaveMode(null);
    setConfirmation({
      isOpen: false,
      action: null,
      title: "",
      message: "",
      variant: "primary",
      confirmText: "Confirm",
    });
    if (shouldReopenProductModal) {
      setIsProductModalOpen(true);
    }
  };

  const handleProductSave = () => {
    void (async () => {
      const isEditingProduct = editingProductId !== null;
      const saved = await saveProduct();
      if (saved) {
        setToastState({
          type: "success",
          message: isEditingProduct ? "Product updated successfully." : "Product added successfully.",
        });
        return;
      }

      setToastState({
        type: "error",
        message: isEditingProduct
          ? "Failed to update product. Please review form errors."
          : "Failed to add product. Please review form errors.",
      });
    })();
  };

  const requestArchiveConfirmation = (product: ProductRecord) => {
    setConfirmation({
      isOpen: true,
      action: "archive",
      productId: product.id,
      title: "Confirm Archive Product",
      message: `Are you sure you want to archive ${product.name}?`,
      variant: "danger",
      confirmText: "Archive Product",
    });
  };

  const handleConfirmationConfirm = () => {
    void (async () => {
      const action = confirmation.action;
      const productId = confirmation.productId;
      const shouldSaveCollection = pendingCollectionSaveMode !== null;
      closeConfirmation({ reopenProductModal: false });

      if (shouldSaveCollection) {
        await saveCollection();
        return;
      }

      if (action === "archive" && productId) {
        const archived = await archiveProduct(productId);
        setToastState({
          type: archived ? "success" : "error",
          message: archived ? "Product archived successfully." : "Failed to archive product.",
        });
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white to-slate-50 px-5 py-4 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Collections</h1>
        <p className="mt-1 text-sm text-slate-500">
          Build and manage seasonal collections with structured metadata and lifecycle controls.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100/80 bg-gradient-to-r from-sky-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Validation Rule</p>
        <p className="mt-1 text-sm text-sky-900">
          Collection code should be unique and launch metadata is required before submission.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Visible Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{filteredCollections.length}</p>
            <p className="mt-1 text-xs text-slate-500">Collections matching current filters.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Target Date Set</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-700">
              {filteredCollections.filter((item) => Boolean(item.launchDate)).length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Collections with target launch date defined.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">With Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-700">
              {filteredCollections.filter((item) => item.notes.trim().length > 0).length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Collections with notes captured.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Collection Cards</CardTitle>
          <CardDescription>
            Click a collection card to open full details and manage products under that collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="px-6 pt-6">
            <TableToolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterLabel="Search"
              placeholder="Search collection name, code, season..."
              onAdd={openAddModal}
              addLabel="Add Collection"
              inlineControls={
                <SecondaryButton
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                >
                  Reset
                </SecondaryButton>
              }
            >
              <div className="space-y-2 p-3">
                <p className="text-[10px] text-slate-500">Search collections by code, name, and season.</p>
              </div>
            </TableToolbar>
          </div>

          {isLoading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">Loading collections...</div>
          ) : pagedCollections.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              No collections found for selected filters.
            </div>
          ) : (
            <div className="grid gap-4 px-6 pb-2 sm:grid-cols-2 lg:grid-cols-3">
              {pagedCollections.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCollectionDetails(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openCollectionDetails(item);
                    }
                  }}
                  className="group flex aspect-square flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <FolderKanban size={16} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Collection</span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                      COL-{item.id}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Collection Name</p>
                      <p className="font-semibold text-slate-800">{item.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Collection Code</p>
                      <p className="font-medium text-slate-700">{item.code || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Season</p>
                      <p className="font-medium text-slate-700">{item.season || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Launch Date</p>
                      <p className="font-medium text-slate-700">{item.launchDate || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-end gap-2 pt-4">
                    <SecondaryButton
                      icon={Pencil}
                      className="!rounded-lg !px-2 !py-2"
                      ariaLabel={`Edit ${item.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(item);
                      }}
                    >
                      <span className="sr-only">Edit</span>
                    </SecondaryButton>
                    <SecondaryButton
                      icon={Archive}
                      className="!rounded-lg !px-2 !py-2"
                      ariaLabel={`Archive ${item.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        archiveCollection(item.id);
                      }}
                    >
                      <span className="sr-only">Archive</span>
                    </SecondaryButton>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredCollections.length}
            onPageChange={(page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)))}
          />
        </CardContent>
      </Card>

      {detailsCollection
        ? createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
              <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                      <FolderKanban size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Collection Details</h3>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        ID: COL-{detailsCollection.id}
                      </p>
                    </div>
                  </div>
                  <button
                    aria-label="Close Collection Details"
                    onClick={() => {
                      setDetailsCollection(null);
                      setDetailsProduct(null);
                      setSelectedViewBOMProduct(null);
                      setIsBOMModalOpen(false);
                      setSelectedBOMProduct(null);
                    }}
                    className="rounded-full p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-6 overflow-y-auto p-6">
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Collection Name</p>
                        <p className="text-sm font-semibold text-slate-800">{detailsCollection.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Collection Code</p>
                        <p className="text-sm font-semibold text-slate-800">{detailsCollection.code || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Season</p>
                        <p className="text-sm font-semibold text-slate-800">{detailsCollection.season || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Launch Date</p>
                        <p className="text-sm font-semibold text-slate-800">{detailsCollection.launchDate || "-"}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Notes</p>
                      <p className="mt-1 text-sm text-slate-700">{detailsCollection.notes || "-"}</p>
                    </div>
                  </div>

                  <Card className="rounded-2xl border-slate-200/80 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Products</CardTitle>
                      <CardDescription>
                        Add products and manage the product list for this collection.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-0">
                      <div className="px-6 pt-6">
                        <TableToolbar
                          searchQuery={productSearchQuery}
                          setSearchQuery={setProductSearchQuery}
                          isFilterOpen={isProductFilterOpen}
                          setIsFilterOpen={setIsProductFilterOpen}
                          filterLabel="Filters"
                          placeholder="Search SKU, product, category, collection, size profile..."
                          onAdd={openAddProductModal}
                          addLabel="Add Product"
                        >
                          <div className="space-y-2 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                            <Select
                              value={productStatusFilter}
                              onValueChange={(value) => {
                                setProductStatusFilter(value);
                                setProductCurrentPage(1);
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="All statuses" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending bom">Pending BOM</SelectItem>
                                <SelectItem value="completed bom">Completed BOM</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="pt-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Last Updated Date</p>
                            <Input
                              type="date"
                              value={productDateFilter}
                              onChange={(event) => {
                                setProductDateFilter(event.target.value);
                                setProductCurrentPage(1);
                              }}
                              className="h-8 text-xs"
                            />
                          </div>
                        </TableToolbar>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-6">Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Collection</TableHead>
                            <TableHead>Size Profile</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="pl-6 text-left">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedProducts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500">
                                No products found for selected filters.
                              </TableCell>
                            </TableRow>
                          ) : (
                            pagedProducts.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="px-6">
                                  <p className="font-medium text-slate-800">{item.name}</p>
                                  <p className="text-xs text-slate-500">{item.sku}</p>
                                </TableCell>
                                <TableCell>{item.category || "-"}</TableCell>
                                <TableCell>{item.quantity ?? 1}</TableCell>
                                <TableCell>{item.collection || detailsCollection.name}</TableCell>
                                <TableCell>{item.sizeProfile}</TableCell>
                                <TableCell>{item.lastUpdated}</TableCell>
                                <TableCell>
                                  <StatusBadge status={getProductBOMStatus(item)} />
                                </TableCell>
                                <TableCell className="pl-6">
                                  <div className="flex items-center justify-start gap-2">
                                    <SecondaryButton
                                      icon={Eye}
                                      className="!rounded-lg !px-2 !py-2"
                                      ariaLabel={`View details of ${item.name}`}
                                      onClick={() => setDetailsProduct(item)}
                                    >
                                      <span className="sr-only">Details</span>
                                    </SecondaryButton>
                                    <SecondaryButton
                                      icon={Pencil}
                                      className="!rounded-lg !px-2 !py-2"
                                      ariaLabel={`Edit ${item.name}`}
                                      onClick={() => openEditProductModal(item)}
                                    >
                                      <span className="sr-only">Edit</span>
                                    </SecondaryButton>
                                    <SecondaryButton
                                      icon={Archive}
                                      className="!rounded-lg !px-2 !py-2"
                                      ariaLabel={`Archive ${item.name}`}
                                      onClick={() => requestArchiveConfirmation(item)}
                                    >
                                      <span className="sr-only">Archive</span>
                                    </SecondaryButton>
                                    <SecondaryButton
                                      className="!rounded-lg !px-3 !py-2 !text-xs"
                                      ariaLabel={`View BOM for ${item.name}`}
                                      onClick={() => openViewBOMModal(item)}
                                    >
                                      View BOM
                                    </SecondaryButton>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>

                      <Pagination
                        currentPage={productSafePage}
                        totalPages={productTotalPages}
                        startIndex={productStartIndex}
                        endIndex={productEndIndex}
                        totalItems={filteredProducts.length}
                        onPageChange={(page) =>
                          setProductCurrentPage(Math.max(1, Math.min(page, productTotalPages)))
                        }
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      <DetailsModal
        isOpen={detailsProduct !== null}
        onClose={() => setDetailsProduct(null)}
        title="Product Details"
        itemId={detailsProduct?.id ?? "-"}
        zIndexClass="z-[90]"
        headerIcon={
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Package2 size={16} />
          </div>
        }
        gridFields={
          detailsProduct
            ? [
                { label: "SKU", value: detailsProduct.sku, icon: Package2 },
                { label: "Product Name", value: detailsProduct.name, icon: Package2 },
                { label: "Category", value: detailsProduct.category, icon: ShieldCheck },
                { label: "Quantity", value: String(detailsProduct.quantity ?? 1), icon: ShieldCheck },
                { label: "Collection", value: detailsProduct.collection, icon: ShieldCheck },
                { label: "Season", value: detailsProduct.season, icon: CalendarClock },
                { label: "Size Profile", value: detailsProduct.sizeProfile, icon: Ruler },
                { label: "Last Updated", value: detailsProduct.lastUpdated, icon: CalendarClock },
                { label: "BOM Status", value: getProductBOMStatus(detailsProduct), icon: ShieldCheck },
              ]
            : []
        }
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Design Notes</p>
            <p className="mt-1 text-sm text-slate-700">{detailsProduct?.designNotes ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Manufacturing Instructions</p>
            <p className="mt-1 text-sm text-slate-700">{detailsProduct?.instructions ?? "-"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Size Profiles</p>
            <div className="mt-2 space-y-2">
              {detailsProduct
                ? (["S", "M", "L", "XL", "XXL"] as SizeKey[]).map((size) => {
                    const row = detailsProduct.sizeMatrix?.[size];
                    const measurementType = row?.measurementType || "cm";
                    return (
                      <div key={size} className="rounded-lg border border-slate-200 p-2">
                        <p className="text-xs font-semibold text-slate-700">Size {size}</p>
                        <div className="mt-1 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                          <p>Chest: {row?.chest || "-"}</p>
                          <p>Neck: {row?.neck || "-"}</p>
                          <p>Shoulder Width: {row?.shoulderWidth || "-"}</p>
                          <p>Sleeve Length: {row?.sleeveLength || "-"}</p>
                          <p>Body Length: {row?.overallBodyLength || "-"}</p>
                          <p>Unit: {measurementType}</p>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <ImagePlus size={16} className="text-indigo-500" />
              <span>Design Photo</span>
            </div>
            {canPreviewDesignPhoto ? (
              <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                <img
                  src={selectedDesignPhoto}
                  alt="Design photo"
                  crossOrigin={selectedDesignPhoto.startsWith("http") ? "anonymous" : undefined}
                  referrerPolicy={selectedDesignPhoto.startsWith("http") ? "no-referrer" : undefined}
                  className="h-48 w-full rounded-md bg-slate-50 object-contain"
                />
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">Not uploaded</p>
            )}
          </div>
        </div>
      </DetailsModal>

      <AddEditProductModal
        isOpen={isProductModalOpen}
        isEditing={editingProductId !== null}
        isSaving={isSavingProduct}
        errorMessage={productFormError}
        fieldErrors={productFieldErrors}
        formData={productFormData}
        designPreviewUrl={designPreviewUrl}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedPhotoFile(null);
          setProductFormError("");
          setProductFieldErrors({});
          clearDesignPreview();
        }}
        onChange={(updates) => {
          setProductFormData((prev) => ({ ...prev, ...updates }));
          setProductFieldErrors((prev) => {
            const next = { ...prev };
            if ("sku" in updates) delete next.sku;
            if ("name" in updates) delete next.name;
            if ("category" in updates) delete next.category;
            if ("quantity" in updates) delete next.quantity;
            if ("designPhoto" in updates) delete next.designPhoto;
            if ("season" in updates) delete next.season;
            if ("designNotes" in updates) delete next.designNotes;
            if ("instructions" in updates) delete next.instructions;
            return next;
          });
        }}
        onPhotoSelect={handlePhotoSelect}
        onSave={handleProductSave}
      />

      <AddBOMModal
        isOpen={isBOMModalOpen && selectedBOMProduct !== null}
        collectionName={detailsCollection?.name ?? "-"}
        productName={selectedBOMProduct?.name ?? "-"}
        materials={materialOptions}
        addedMaterials={bomLines}
        formData={bomFormData}
        fieldErrors={bomFieldErrors}
        formError={bomFormError}
        onClose={() => {
          setIsBOMModalOpen(false);
          setSelectedBOMProduct(null);
          setBomLines([]);
          setBomFieldErrors({});
          setBomFormError("");
        }}
        onChange={(updates) => {
          setBomFormData((prev) => ({ ...prev, ...updates }));
          setBomFieldErrors((prev) => {
            const next = { ...prev };
            if ("materialId" in updates) delete next.materialId;
            if ("qty" in updates) delete next.qty;
            if ("unit" in updates) delete next.unit;
            delete next.materials;
            return next;
          });
        }}
        onAddMaterial={addMaterialToBOM}
        onRemoveMaterial={removeMaterialFromBOM}
        onSave={saveBOMLine}
      />

      <ViewBOMModal
        isOpen={selectedViewBOMProduct !== null}
        collectionName={detailsCollection?.name ?? "-"}
        productName={selectedViewBOMProduct?.name ?? "-"}
        lines={
          selectedViewBOMProduct
            ? bomByProductId.get(toNumericProductId(selectedViewBOMProduct.id)) ?? []
            : []
        }
        onClose={() => setSelectedViewBOMProduct(null)}
        onAddBOM={() => {
          if (!selectedViewBOMProduct) return;
          openAddBOMModal(selectedViewBOMProduct);
        }}
      />

      <AddEditCollectionModal
        isOpen={isModalOpen}
        isEditing={editingId !== null}
        formData={formData}
        fieldErrors={collectionFieldErrors}
        formError={collectionFormError}
        onClose={() => {
          setIsModalOpen(false);
          setCollectionFieldErrors({});
          setCollectionFormError("");
        }}
        onChange={(updates) => {
          setFormData((prev) => ({ ...prev, ...updates }));
          setCollectionFieldErrors((prev) => {
            const next = { ...prev };
            if ("code" in updates) delete next.code;
            if ("name" in updates) delete next.name;
            if ("season" in updates) delete next.season;
            if ("launchDate" in updates) delete next.launchDate;
            if ("notes" in updates) delete next.notes;
            return next;
          });
        }}
        onSave={requestSaveCollection}
      />

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirmationConfirm}
        title={confirmation.title}
        message={confirmation.message}
        variant={confirmation.variant}
        confirmText={confirmation.confirmText}
      />

      {toastState && (
        <Toast
          type={toastState.type}
          message={toastState.message}
          onClose={() => setToastState(null)}
        />
      )}
    </div>
  );
}
