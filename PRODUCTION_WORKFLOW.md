# Product-Based Production Workflow (Collection as FK)

## Overview
Production runs are now **product-based** instead of collection-based. Each product is tracked independently through the entire lifecycle. `CollectionID` serves as a foreign key for inventory traceability only.

---

## Database Schema

### ProductionOrder Table
**Purpose**: Stores each production order (created after admin approval)

**Columns**:
- `OrderID` (int, PK) - Unique production order identifier
- `CollectionName` (nvarchar(180)) - Collection name for traceability
- `VersionID` (int, nullable, FK) - Links to ProductionVersion
- `Products` (nvarchar(2000)) - Serialized list of product details (JSON)
- `Status` (nvarchar(40)) - Production status (Pending, In Progress, Completed)
- `DueDate` (date, nullable) - Target completion date
- `CreatedAt` (datetime2) - Record creation timestamp
- `UpdatedAt` (datetime2, nullable) - Last update timestamp

**Entry Point**: After approval in `http://localhost:5173/admin/approval-inbox`, records are stored here with `Status = "Pending"`.

### ProductionVersion Table (NEW - replaces ProductVersion)
**Purpose**: Tracks production versions per collection/order context

**Columns**:
- `VersionID` (int, PK, identity) - Unique version identifier
- `VersionNumber` (nvarchar(50)) - Version label (e.g., "Version 1", "V2-REV-A")
- `OrderID` (int, FK) - Links to ProductionOrder
- `CollectionID` (int, FK) - Collection foreign key (inventory traceability)
- `CollectionCode` (nvarchar(80)) - Collection code for reference
- `CollectionName` (nvarchar(180)) - Collection name for display
- `CreatedAt` (datetime2) - Record creation timestamp
- `UpdatedAt` (datetime2, nullable) - Last update timestamp

**Relationships**:
- FK to `ProductionOrder.OrderID`
- FK to `Collection.CollectionID` (for inventory linkage)
- Referenced by `ProductionInventory`, `BudgetReservation`, `BranchRequestItem`, `TransferItem`

### RunSchedule Table (Existing)
**Purpose**: Detailed scheduling data per product run

**Key Columns**:
- `RunScheduleID` (int, PK)
- `ScheduleKey` (nvarchar(80), unique) - Composite key: `{CollectionID}-{ProductID}`
- `CollectionID` (int) - Collection FK (traceability)
- `ProductID` (int) - Product FK (primary workflow key)
- `RunCode` (nvarchar(100)) - Generated run identifier
- `LineTeam`, `OwnerAssignment` - Scheduling details
- `StartDate`, `EndDate` - Run timeline
- `PlannedQty` (int) - Total product quantity
- `Status` (nvarchar(40)) - Lifecycle status (For Scheduling → Ready → Schedule Running → Finished Run)
- `SizePlanJson` (nvarchar(MAX)) - Size breakdown as JSON (e.g., `{"S":10,"M":15,"L":20}`)
- Denormalized fields for display: `CollectionCode`, `CollectionName`, `ProductSKU`, `ProductName`

---

## Production Workflow Lifecycle

### 1. Queue Creation (Per Product)
**Where**: `http://localhost:5173/production/queue` (Pending tab)

**Entry Condition**:
- Product is approved in admin approval inbox
- Collection has approved budget and production clearance

**Data Source**: 
- Backend endpoint: `GET /api/productionorder/queue`
- Joins: `Collection`, `Budget`, `CollectionBudgetPlan`, `Product`
- Each row = 1 product (not grouped by collection)

**Display**:
- Collection code & name (for traceability)
- Product SKU, name, planned qty
- Due date (from collection target launch date)
- Status: **Pending**

**Action**: **Start** button

---

### 2. Start Production Prep
**Trigger**: Click **Start** button on a product row in Pending tab

**Backend Action**: None (frontend-only state change at this stage)

**Frontend Action**:
- Creates `RunScheduleRecord` with:
  - `key`: `{CollectionID}-{ProductID}`
  - `runCode`: `RUN-{CollectionCode}-{ProductSKU}` (e.g., `RUN-COL-2025-SUMMER-SHIRT-001`)
  - `status`: `"For Scheduling"`
  - `collectionId`, `productId`: for FK linkage
  - `sizePlan`: `{}` (empty, to be filled in scheduler)
- Saves to `localStorage` + persists to backend via `POST /api/production/run-schedules`

**Result**:
- Product row moves to **On Going** tab
- Display status: **For Scheduling**

---

### 3. Run Scheduling (Per Product)
**Where**: `http://localhost:5173/production/run-scheduler` (For Scheduling table)

**Display**: Products with status `"For Scheduling"`

**Action**: **Add Schedule** button

**Modal (Run Scheduling Form)**:
- **Read-only fields**:
  - Run Code (auto-generated)
  - Planned Quantity (from product)
  - Product details
  - Collection info
- **Editable fields**:
  - Line / Team Assignment
  - Owner Assignment
  - Start Date / End Date
  - **Product Size Breakdown**: Input quantity per size (S, M, L, XL, etc.)

**Validation Rule**:
- Sum of all size quantities MUST equal planned product quantity
- Example: If planned qty = 100, size breakdown must be: S:20, M:30, L:30, XL:15, XXL:5 = 100 total

**Auto Distribute Button**: Evenly splits planned quantity across sizes

**On Save**:
- Status changes to **"Ready"**
- Row moves from "For Scheduling" table to "Scheduled Runs" table
- Backend: `PUT /api/production/run-schedules` with updated `SizePlanJson`

---

### 4. Run Execution
**Where**: `http://localhost:5173/production/run-scheduler` (Scheduled Runs table)

**Stage 1: Start Run**
- Display: Products with status `"Ready"`
- Action: **Run Schedule** button
- Result: Status → **"Schedule Running"**, button changes to **Finish Run**

**Stage 2: Complete Run**
- Display: Products with status `"Schedule Running"`
- Action: **Finish Run** button
- Result: Status → **"Finished Run"**

**Real-Time Sync**:
- Frontend polls `GET /api/production/run-schedules` every 2.5 seconds
- Queue page (`/production/queue` On Going tab) reflects status changes instantly

---

### 5. Queue Status Display (Real-Time)
**Where**: `http://localhost:5173/production/queue` (On Going tab)

**Status Progression**:
1. **For Scheduling** - Start button clicked, awaiting schedule details
2. **Ready** - Schedule added with size breakdown, ready to execute
3. **Schedule Running** - Production run in progress
4. **Finished Run** - Production completed, moves to Completed tab

---

## Inventory & Traceability Rules

### Collection as Foreign Key
- `CollectionID` is present on **every** `RunScheduleRecord`
- Used for:
  - Inventory reporting (grouping finished products by collection)
  - Budget tracking (allocating costs to collection budgets)
  - Traceability (linking production back to design/planning phase)
- **NOT** used for:
  - Workflow grouping (no multi-product batch actions)
  - Status determination (status is per-product, not per-collection)

### Production Transactions
When a product run finishes (`status = "Finished Run"`), the system should:
1. Record in `ProductionInventory` with:
   - `ProductID` (primary key)
   - `VersionID` (links to `ProductionVersion.VersionID`)
   - Size breakdown quantities (from `SizePlanJson`)
2. Link back to `CollectionID` via `ProductionVersion.CollectionID` for inventory reports

---

## Status Lifecycle Summary

```
[Admin Approval] 
    ↓
[Pending] (Queue - Pending tab)
    ↓ [Start button]
[For Scheduling] (Queue - On Going tab / Scheduler - For Scheduling table)
    ↓ [Add Schedule modal + validation]
[Ready] (Scheduler - Scheduled Runs table)
    ↓ [Run Schedule button]
[Schedule Running] (Scheduler - Scheduled Runs table)
    ↓ [Finish Run button]
[Finished Run] (Queue - Completed tab)
```

---

## Key Benefits of Product-Based Workflow

1. **Granular Control**: Each product can have different timelines, teams, and size breakdowns
2. **Flexible Scheduling**: Products from same collection can run on different lines/dates
3. **Clear Traceability**: `CollectionID` FK maintains linkage without forcing workflow grouping
4. **Independent Lifecycle**: One product's delay doesn't block others
5. **Accurate Inventory**: Size-level planning matches real production output

---

## API Endpoints

### Production Queue
- **GET** `/api/productionorder/queue` - Returns product-based queue rows
  - Response: Array of `ProductionQueueItemDto` (one per product)

### Run Schedules
- **GET** `/api/production/run-schedules` - Returns all run schedule records
  - Response: Array of `RunScheduleRecordDto` with `SizePlanJson`
- **PUT** `/api/production/run-schedules` - Upserts run schedules
  - Request body: `{ "Items": [RunScheduleRecordDto[]] }`

---

## Frontend Key Files

### `/src/pages/ProductionManager/ProductionQueuePage.tsx`
- Displays product rows (not collection rows)
- Resolves status per product using `RunScheduleRecord` linkage
- "Start" button creates `RunScheduleRecord` with status `"For Scheduling"`

### `/src/pages/ProductionManager/RunSchedulerPage.tsx`
- Lists products with status `"For Scheduling"` in first table
- "Add Schedule" modal validates size breakdown
- "Scheduled Runs" table handles `Ready → Schedule Running → Finished Run` progression

### `/src/lib/runScheduleStorage.ts`
- Manages `RunScheduleRecord[]` state with localStorage + backend persistence
- `persistRunSchedulesToBackend`: stringifies `sizePlan` to `SizePlanJson`
- `hydrateRunSchedules`: parses `SizePlanJson` back to `sizePlan` object

---

## Backend Key Files

### Models
- **`Models/ProductionOrder.cs`**: New schema (removed BranchID, user audit fields)
- **`Models/ProductionVersion.cs`**: New model (replaced ProductVersion)
- **`Models/RunSchedule.cs`**: Existing, includes `SizePlanJson`

### Controllers
- **`Controllers/ProductionOrdersController.cs`**: Returns product-based queue data
- **`Controllers/RunSchedulesController.cs`**: CRUD for run schedules with SQL persistence

### DbContext
- **`Services/ApplicationDBContext.cs`**: 
  - `DbSet<ProductionVersion>` replaces `DbSet<ProductVersion>`
  - FK: `ProductionVersion` → `ProductionOrder` (OrderID)
  - FK: `ProductionVersion` → `Collection` (CollectionID)

---

## Migration Applied
**Migration**: `20260308141001_RefactorProductionWorkflowToProductBased`

**Changes**:
- Dropped `ProductVersion` table (all FK constraints cleared)
- Created `ProductionVersion` table with new schema
- Updated `ProductionOrder`: added `CollectionName`, `Products`, `DueDate`; removed `BranchID`, `PlannedQty`, `StartDate`, user audit fields
- Cleaned orphaned data in referencing tables

---

## Testing Checklist

1. **Queue Display** (`/production/queue`):
   - [ ] Pending tab shows products (one row per product, not per collection)
   - [ ] Collection info displayed for traceability
   - [ ] "Start" button moves product to On Going with "For Scheduling" status

2. **Scheduler** (`/production/run-scheduler`):
   - [ ] For Scheduling table lists started products
   - [ ] "Add Schedule" modal opens with run code, planned qty (disabled)
   - [ ] Size breakdown inputs work per product
   - [ ] "Auto Distribute" evenly splits qty across sizes
   - [ ] Validation prevents saving if size total ≠ planned qty
   - [ ] After saving, product moves to "Scheduled Runs" with "Ready" status

3. **Run Execution**:
   - [ ] "Run Schedule" button changes status to "Schedule Running"
   - [ ] "Finish Run" button changes status to "Finished Run"
   - [ ] Status updates reflect in real-time on Queue page (On Going → Completed)

4. **Data Integrity**:
   - [ ] `RunSchedule.CollectionID` populated for all records
   - [ ] `SizePlanJson` saved correctly in database
   - [ ] Frontend polling updates every 2.5 seconds

---

## Next Steps (Suggested)

1. **Admin Approval Integration**: Update admin approval page to create `ProductionOrder` records with `Status = "Pending"` after approval
2. **Inventory Module**: Build finished goods inventory tracking using `CollectionID` FK from `ProductionVersion`
3. **Reporting**: Create collection-level summary reports by aggregating product runs via `CollectionID`
4. **Batch Management**: Link `ProductionBatch` records to specific `RunSchedule` records for WIP tracking

---

*Last Updated: March 8, 2026*
