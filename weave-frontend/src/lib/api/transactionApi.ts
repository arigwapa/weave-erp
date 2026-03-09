// transactionApi.ts - stock movement records for materials and finished goods
// /api/materialtransaction + /api/producttransaction
import { apiGet, apiPost, apiPut, apiDelete } from "../http";

export interface MaterialTransaction {
  MatTransID: number;
  MatInvID: number;
  UserID: number;
  QtyChanged: number;
  TransactionType: string;
  TransactionDate: string;
}

export interface CreateMaterialTransactionDto {
  MatInvID: number;
  UserID: number;
  QtyChanged: number;
  TransactionType: string;
  TransactionDate: string;
}

export interface UpdateMaterialTransactionDto {
  QtyChanged: number;
  TransactionType: string;
  TransactionDate: string;
}

export interface ProductTransaction {
  ProdTransID: number;
  ProdInvID: number;
  UserID: number;
  QtyChanged: number;
  TransactionType: string;
  TransactionDate: string;
}

export interface CreateProductTransactionDto {
  ProdInvID: number;
  UserID: number;
  QtyChanged: number;
  TransactionType: string;
  TransactionDate: string;
}

export interface UpdateProductTransactionDto {
  QtyChanged: number;
  TransactionType: string;
  TransactionDate: string;
}

// raw material movements
export const materialTransactionApi = {
  list: () => apiGet<MaterialTransaction[]>("/api/materialtransaction"),
  get: (id: number) => apiGet<MaterialTransaction>(`/api/materialtransaction/${id}`),
  create: (dto: CreateMaterialTransactionDto) => apiPost<MaterialTransaction>("/api/materialtransaction", dto),
  update: (id: number, dto: UpdateMaterialTransactionDto) => apiPut<MaterialTransaction>(`/api/materialtransaction/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/materialtransaction/${id}`),
};

// finished goods movements
export const productTransactionApi = {
  list: () => apiGet<ProductTransaction[]>("/api/producttransaction"),
  get: (id: number) => apiGet<ProductTransaction>(`/api/producttransaction/${id}`),
  create: (dto: CreateProductTransactionDto) => apiPost<ProductTransaction>("/api/producttransaction", dto),
  update: (id: number, dto: UpdateProductTransactionDto) => apiPut<ProductTransaction>(`/api/producttransaction/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/producttransaction/${id}`),
};
