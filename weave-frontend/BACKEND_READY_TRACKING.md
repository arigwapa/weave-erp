# Frontend Backend-Readiness Tracking

This project now supports a **backend-enabled mode** with safe local fallback.

## Toggle

- `VITE_DISABLE_BACKEND=true` -> local-first mode (no backend calls)
- `VITE_DISABLE_BACKEND=false` -> backend-enabled mode

The toggle is centralized in `src/lib/backendConfig.ts`.

## Added Tracking Markers

Search for `BACKEND-TRACK` comments to find integration points quickly.

## Modules Wired For Hydrate + Persist

- `src/lib/productStorage.ts`
  - `hydrateProducts()`
  - `persistProductsToBackend()`
  - endpoint: `/api/plm/products`
- `src/lib/materialStorage.ts`
  - `hydrateMaterials()`
  - `persistMaterialsToBackend()`
  - endpoint: `/api/plm/materials`
- `src/lib/restockRequestStorage.ts`
  - `hydrateRestockRequests()`
  - `persistRestockRequestsToBackend()`
  - endpoint: `/api/branch/restock-requests`
- `src/lib/batchStorage.ts`
  - `hydrateBatches()`
  - `persistBatchesToBackend()`
  - endpoint: `/api/production/batches`
- `src/lib/runScheduleStorage.ts`
  - `hydrateRunSchedules()`
  - `persistRunSchedulesToBackend()`
  - endpoint: `/api/production/run-schedules`
- `src/lib/branchStorage.ts`
  - `hydrateBranchWarehouseData()`
  - `persistBranchesToBackend()`
  - `persistWarehousesToBackend()`
  - endpoints: `/api/superadmin/branches`, `/api/superadmin/warehouses`

## Pages Wired To Use Backend Adapters

- `src/pages/PLMManager/ProductsSizesPage.tsx`
- `src/pages/PLMManager/MaterialListPage.tsx`
- `src/pages/BranchManager/InventoryPage.tsx`
- `src/pages/BranchManager/RequestTrackerPage.tsx`
- `src/pages/BranchManager/RestockRequestPage.tsx`
- `src/pages/ProductionManager/BatchManagementPage.tsx`
- `src/pages/ProductionManager/HandoffQAPage.tsx`
- `src/pages/ProductionManager/RunSchedulerPage.tsx`
- `src/pages/ProductionManager/ProductionQueuePage.tsx`
- `src/pages/SuperAdmin/BranchWarehouseManagementPage.tsx`

## Backend Contract Note

Persist helpers currently send payloads as:

- `PUT <endpoint>` with `{ items: [...] }`

If your backend expects different DTO shapes (for example raw arrays or per-item CRUD),
update only the adapter functions in `src/lib/*Storage.ts` and keep page logic unchanged.

