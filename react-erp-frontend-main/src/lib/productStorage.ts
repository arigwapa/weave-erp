import { apiGet } from "./http";

export type ProductStatus = "Draft" | "Under Review" | "Ready" | "Archived";
export type SizeKey = "S" | "M" | "L" | "XL" | "XXL";
export type SizeMeasurement = {
  chest: string;
  neck: string;
  shoulderWidth: string;
  sleeveLength: string;
  overallBodyLength: string;
  measurementType: string;
};
export type SizeMatrix = Record<SizeKey, SizeMeasurement>;

export type ProductRecord = {
  id: string;
  sku: string;
  name: string;
  category: string;
  collection: string;
  season: string;
  sizeProfile: string;
  quantity: number;
  lastUpdated: string;
  status: ProductStatus;
  designPhoto: string;
  sizeMatrix: SizeMatrix;
  attachments: string;
  designNotes: string;
  instructions: string;
};

const PRODUCT_STORAGE_KEY = "erp_plm_products_v1";
// BACKEND-TRACK: align with products endpoint contract.
export const PRODUCTS_API_PATH = "/api/products";

export const createDefaultSizeMatrix = (): SizeMatrix => ({
  S: { chest: "", neck: "", shoulderWidth: "", sleeveLength: "", overallBodyLength: "", measurementType: "cm" },
  M: { chest: "", neck: "", shoulderWidth: "", sleeveLength: "", overallBodyLength: "", measurementType: "cm" },
  L: { chest: "", neck: "", shoulderWidth: "", sleeveLength: "", overallBodyLength: "", measurementType: "cm" },
  XL: { chest: "", neck: "", shoulderWidth: "", sleeveLength: "", overallBodyLength: "", measurementType: "cm" },
  XXL: { chest: "", neck: "", shoulderWidth: "", sleeveLength: "", overallBodyLength: "", measurementType: "cm" },
});

export const DEFAULT_PRODUCTS: ProductRecord[] = [];

const toSafeStatus = (value: unknown): ProductStatus => {
  const status = String(value ?? "").trim().toLowerCase();
  if (status === "under review") return "Under Review";
  if (status === "ready") return "Ready";
  if (status === "archived") return "Archived";
  return "Draft";
};

const normalizeMeasurement = (raw: any): SizeMeasurement => {
  const measurementType = String(raw?.measurementType ?? raw?.unit ?? "cm").trim() || "cm";
  return {
    chest: String(raw?.chest ?? "").trim(),
    neck: String(raw?.neck ?? "").trim(),
    shoulderWidth: String(raw?.shoulderWidth ?? "").trim(),
    sleeveLength: String(raw?.sleeveLength ?? "").trim(),
    overallBodyLength: String(raw?.overallBodyLength ?? raw?.length ?? "").trim(),
    measurementType,
  };
};

const normalizeSizeMatrix = (raw: any): SizeMatrix => {
  const defaults = createDefaultSizeMatrix();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  return {
    S: normalizeMeasurement(raw.S),
    M: normalizeMeasurement(raw.M),
    L: normalizeMeasurement(raw.L),
    XL: normalizeMeasurement(raw.XL),
    XXL: normalizeMeasurement(raw.XXL),
  };
};

const parseSizeProfileMatrix = (rawSizeProfile: string): SizeMatrix | null => {
  const candidate = rawSizeProfile.trim();
  if (!candidate.startsWith("{")) {
    return null;
  }

  try {
    const parsed = JSON.parse(candidate);
    return normalizeSizeMatrix(parsed);
  } catch {
    return null;
  }
};

const normalizeProductRecord = (raw: any): ProductRecord => {
  const now = new Date().toISOString().slice(0, 10);
  const rawSizeProfile = String(raw.sizeProfile ?? raw.SizeProfile ?? "").trim();
  const sizeProfileMatrix = parseSizeProfileMatrix(rawSizeProfile);

  return {
    id: String(raw.id ?? raw.ID ?? raw.ProductID ?? `PRD-${Math.floor(1000 + Math.random() * 9000)}`),
    sku: String(raw.sku ?? raw.SKU ?? "").trim(),
    name: String(raw.name ?? raw.Name ?? "").trim(),
    category: String(raw.category ?? raw.Category ?? "").trim(),
    collection: String(raw.collection ?? raw.Collection ?? "").trim() || String(raw.Season ?? "").trim(),
    season: String(raw.season ?? raw.Season ?? "").trim(),
    sizeProfile: sizeProfileMatrix ? "S/M/L/XL/XXL" : rawSizeProfile,
    quantity: Number(raw.quantity ?? raw.Quantity ?? 1) > 0 ? Number(raw.quantity ?? raw.Quantity ?? 1) : 1,
    lastUpdated: String(raw.lastUpdated ?? raw.UpdatedAt ?? raw.CreatedAt ?? now).slice(0, 10),
    status: toSafeStatus(raw.status ?? raw.Status),
    designPhoto: String(raw.designPhoto ?? raw.DesignPhoto ?? raw.ImageUrl ?? ""),
    sizeMatrix: sizeProfileMatrix ?? normalizeSizeMatrix(raw.sizeMatrix),
    attachments: String(raw.attachments ?? raw.Attachments ?? ""),
    designNotes: String(raw.designNotes ?? raw.DesignNotes ?? raw.Description ?? ""),
    instructions: String(
      raw.instructions ??
      raw.Instructions ??
      raw.manufacturingInstructions ??
      raw.ManufacturingInstructions ??
      "",
    ),
  };
};

export const loadProducts = (): ProductRecord[] => {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  try {
    const raw = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!raw) return DEFAULT_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PRODUCTS;
    }
    return parsed
      .map(normalizeProductRecord)
      .filter((item) => String(item.status ?? "").toLowerCase() !== "archived");
  } catch {
    return DEFAULT_PRODUCTS;
  }
};

export const saveProducts = (items: ProductRecord[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(items));
};

// BACKEND-TRACK: page-level migration target.
// 1) call hydrateProducts() on mount
// 2) call persistProductsToBackend() after local save
export const hydrateProducts = async (): Promise<ProductRecord[]> => {
  try {
    const records = await apiGet<unknown[]>(PRODUCTS_API_PATH);
    if (!Array.isArray(records)) return loadProducts();
    const normalized = records
      .map(normalizeProductRecord)
      .filter((item) => String(item.status ?? "").toLowerCase() !== "archived");
    saveProducts(normalized);
    return normalized;
  } catch {
    return loadProducts();
  }
};

export const persistProductsToBackend = async (
  items: ProductRecord[],
): Promise<void> => {
  void items;
  // This page now persists via explicit create/update/archive endpoints.
  // Keep this function as a no-op to avoid accidental unsupported bulk updates.
};
