import { apiDelete, apiGet, apiPost, apiPut } from "../http";

export interface Collection {
  CollectionID: number;
  CollectionCode: string;
  CollectionName: string;
  Season: string;
  TargetLaunchDate: string;
  Notes?: string;
  Status: string;
  CreatedByUserID?: number;
  CreatedAt?: string;
  UpdatedByUserID?: number;
  UpdatedAt?: string;
}

export interface CreateCollectionDto {
  CollectionCode: string;
  CollectionName: string;
  Season: string;
  TargetLaunchDate: string;
  Notes?: string;
}

export interface UpdateCollectionDto {
  CollectionCode?: string;
  CollectionName?: string;
  Season?: string;
  TargetLaunchDate?: string;
  Notes?: string;
  Status?: string;
}

export const collectionsApi = {
  list: () => apiGet<Collection[]>("/api/collections"),
  listArchived: () => apiGet<Collection[]>("/api/collections/archived"),
  get: (id: number) => apiGet<Collection>(`/api/collections/${id}`),
  create: (dto: CreateCollectionDto) => apiPost<Collection>("/api/collections", dto),
  update: (id: number, dto: UpdateCollectionDto) =>
    apiPut<Collection>(`/api/collections/${id}`, dto),
  remove: (id: number) => apiDelete(`/api/collections/${id}`),
  archive: (id: number) => apiPut<void>(`/api/collections/${id}/archive`, {}),
  restore: (id: number) => apiPut<void>(`/api/collections/${id}/restore`, {}),
};
