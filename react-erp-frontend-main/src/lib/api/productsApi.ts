// productsApi.ts - garment product catalog (/api/products)
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface Product {
  ProductID: number;
  SKU: string;
  Name: string;
  Category: string;
  ImageUrl?: string;
  Status: string;
  DesignNotes: string;
  ManufacturingInstructions: string;
  SizeProfile: string;
  Season: string;
  Quantity: number;
  ApprovalStatus?: string;
}

export interface CreateProductDto {
  SKU: string;
  Name: string;
  Category: string;
  ImageUrl?: string;
  Status: string;
  DesignNotes: string;
  ManufacturingInstructions: string;
  SizeProfile: string;
  Season: string;
  Quantity: number;
}

export interface UpdateProductDto {
  SKU: string;
  Name: string;
  Category: string;
  ImageUrl?: string;
  Status: string;
  DesignNotes: string;
  ManufacturingInstructions: string;
  SizeProfile: string;
  Season: string;
  Quantity: number;
  ApprovalStatus?: string;
}

export const productsApi = {
  list: () => apiGet<Product[]>("/api/products"),
  listArchived: () => apiGet<Product[]>("/api/products/archived"),
  get: (id: number) => apiGet<Product>(`/api/products/${id}`),
  create: (dto: CreateProductDto) => apiPost<Product>("/api/products", dto),
  update: (id: number, dto: UpdateProductDto) => apiPut<Product>(`/api/products/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/products/${id}`),
  archive: (id: number) => apiPut<void>(`/api/products/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/products/${id}/restore`, {}),
};
