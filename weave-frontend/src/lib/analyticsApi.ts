// analyticsApi.ts - calls to /api/analytics for dashboard charts, report data, and PDF chart images
import { apiGet, apiPost } from "./http";

export interface RejectionRateRow {
  weekLabel: string;
  totalInspections: number;
  rejectedInspections: number;
  rejectionRate: number;
}

export interface TopDefectRow {
  defectType: string;
  count: number;
}

export interface OpenCapaResult {
  openCapaCount: number;
}

export interface OutputVsWasteRow {
  weekLabel: string;
  outputQty: number;
  wasteQty: number;
}

export interface MaterialInventoryRow {
  materialName: string;
  quantityOnHand: number;
}

export interface ChartUrlResult {
  chartUrl: string;
}

export interface ExecutiveReportResult {
  reportText: string;
}

// builds ?from=...&to=... query params
function qs(from?: string, to?: string): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const s = params.toString();
  return s ? `?${s}` : "";
}

// data endpoints - raw numbers for frontend charts
export const getRejectionRate = (from?: string, to?: string) =>
  apiGet<RejectionRateRow[]>(`/api/analytics/rejection-rate${qs(from, to)}`);

export const getTopDefects = (from?: string, to?: string) =>
  apiGet<TopDefectRow[]>(`/api/analytics/top-defects${qs(from, to)}`);

export const getOpenCapa = () =>
  apiGet<OpenCapaResult>("/api/analytics/open-capa");

export const getOutputVsWaste = (from?: string, to?: string) =>
  apiGet<OutputVsWasteRow[]>(`/api/analytics/output-vs-waste${qs(from, to)}`);

export const getMaterialInventory = () =>
  apiGet<MaterialInventoryRow[]>("/api/analytics/material-inventory");

// chart image endpoints - server-rendered PNGs used in PDF exports
export const getRejectionRateChartUrl = (from?: string, to?: string) =>
  apiGet<ChartUrlResult>(`/api/analytics/charts/rejection-rate${qs(from, to)}`);

export const getTopDefectsChartUrl = (from?: string, to?: string) =>
  apiGet<ChartUrlResult>(`/api/analytics/charts/top-defects${qs(from, to)}`);

export const getOutputVsWasteChartUrl = (from?: string, to?: string) =>
  apiGet<ChartUrlResult>(`/api/analytics/charts/output-vs-waste${qs(from, to)}`);

// POST /api/analytics/executive-report - AI-generated summary
export const generateExecutiveReport = (from?: string, to?: string, focus?: string) =>
  apiPost<ExecutiveReportResult>("/api/analytics/executive-report", { from, to, focus });
