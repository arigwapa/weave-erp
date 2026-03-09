import { apiGet, apiPut } from "./http";

export type MaterialStatus = "Active" | "Inactive" | "Archived";

export type MaterialRecord = {
  id: string;
  materialId?: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  supplier: string;
  lastUpdated: string;
  status: MaterialStatus;
  notes: string;
  createdByUserID?: number;
  createdAt?: string;
  updatedByUserID?: number | null;
  updatedAt?: string | null;
};

const MATERIAL_STORAGE_KEY = "erp.plm.materials";
// BACKEND-TRACK: aligned with MaterialsController route.
export const MATERIALS_API_PATH = "/api/materials";

export const DEFAULT_MATERIALS: MaterialRecord[] = [];

export function loadMaterials(): MaterialRecord[] {
  try {
    const raw = localStorage.getItem(MATERIAL_STORAGE_KEY);
    if (!raw) return DEFAULT_MATERIALS;
    const parsed = JSON.parse(raw) as MaterialRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MATERIALS;
    return parsed;
  } catch {
    return DEFAULT_MATERIALS;
  }
}

export function saveMaterials(materials: MaterialRecord[]): void {
  localStorage.setItem(MATERIAL_STORAGE_KEY, JSON.stringify(materials));
}

// BACKEND-TRACK: page-level migration target.
// 1) call hydrateMaterials() on mount
// 2) call persistMaterialsToBackend() after local save
export async function hydrateMaterials(): Promise<MaterialRecord[]> {
  try {
    const records = await apiGet<MaterialRecord[]>(MATERIALS_API_PATH);
    if (!Array.isArray(records)) return loadMaterials();
    saveMaterials(records);
    return records;
  } catch {
    return loadMaterials();
  }
}

export async function persistMaterialsToBackend(
  materials: MaterialRecord[],
): Promise<void> {
  try {
    await apiPut<void>(MATERIALS_API_PATH, { items: materials });
  } catch {
    // Intentionally non-blocking so local UX remains responsive.
  }
}
