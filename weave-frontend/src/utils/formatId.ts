// formatId.ts - turns raw DB IDs into display codes like "BR001", "PO042"
const ID_PREFIXES = {
  Branch:    "BR",
  User:      "US",
  Product:   "PR",
  Version:   "PV",
  Material:  "MT",
  BOM:       "BM",
  Order:     "PO",
  Batch:     "PB",
  Log:       "LG",
  Inspection:"IN",
  Defect:    "DF",
  CAPA:      "CP",
  Bin:       "BN",
  MatInv:    "MI",
  ProdInv:   "PI",
  MatTrans:  "MTX",
  ProdTrans: "PTX",
  Cost:      "CR",
} as const;

type IdEntity = keyof typeof ID_PREFIXES;

// e.g. formatId("Branch", 1) => "BR001"
export function formatId(entity: IdEntity, id: number, pad: number = 3): string {
  return `${ID_PREFIXES[entity]}${String(id).padStart(pad, "0")}`;
}

// Convenience shortcuts for the most-used entities
export const fmtBranch     = (id: number) => formatId("Branch", id);
export const fmtUser       = (id: number) => formatId("User", id);
export const fmtProduct    = (id: number) => formatId("Product", id);
export const fmtVersion    = (id: number) => formatId("Version", id);
export const fmtMaterial   = (id: number) => formatId("Material", id);
export const fmtBOM        = (id: number) => formatId("BOM", id);
export const fmtOrder      = (id: number) => formatId("Order", id);
export const fmtBatch      = (id: number) => formatId("Batch", id);
export const fmtLog        = (id: number) => formatId("Log", id);
export const fmtInspection = (id: number) => formatId("Inspection", id);
export const fmtDefect     = (id: number) => formatId("Defect", id);
export const fmtCAPA       = (id: number) => formatId("CAPA", id);
export const fmtBin        = (id: number) => formatId("Bin", id);
export const fmtMatInv     = (id: number) => formatId("MatInv", id);
export const fmtProdInv    = (id: number) => formatId("ProdInv", id);
export const fmtMatTrans   = (id: number) => formatId("MatTrans", id);
export const fmtProdTrans  = (id: number) => formatId("ProdTrans", id);
export const fmtCost       = (id: number) => formatId("Cost", id);
