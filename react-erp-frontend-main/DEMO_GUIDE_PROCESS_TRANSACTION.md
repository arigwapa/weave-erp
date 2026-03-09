# ERP Demo Guide: Process Transaction Flow

This guide is designed for your live demo from **start to finish** and also **vice versa** (reverse trace from stock-in back to setup).

---

## A. Forward Flow (Start to Finish)

Use this order during demo:

1. Super Admin setup
2. PLM setup
3. Finance setup
4. Admin approvals
5. Production execution
6. Branch operations (inventory, request, receiving/stock-in)
7. Reports and audit trail

---

## 1) Super Admin: Foundation Setup

### 1.1 Add Warehouses and Branches
- Page: `Super Admin > Branch & Warehouse Management`
- Action:
  - Create warehouse records
  - Create branch records and link warehouse
  - Edit/archive sample records
- Demo point:
  - Data persists and is visible for downstream operations

### 1.2 Add Users and Access
- Page: `Super Admin > User Management`
- Action:
  - Add users for roles: PLM, Finance, Admin, Production, Branch Manager
  - Toggle active/inactive and show archive
- Demo point:
  - Shows CRUD and role onboarding

### 1.3 Governance Pages
- Pages: `Role Permission Matrix`, `System Settings`, `Audit Center`, `Activity Monitor`
- Action:
  - Show validation/compliance blocks
  - Show export in top-right where available

---

## 2) PLM Manager: Product + BOM Creation

### 2.1 Maintain Materials (CRUD)
- Page: `PLM > Material List`
- Action:
  - Add material
  - Edit material
  - Archive material
  - Open details modal (eye icon)

### 2.2 Maintain Products and Sizes (CRUD)
- Page: `PLM > Products & Sizes`
- Action:
  - Add product with size matrix
  - Upload design photo
  - Edit/archive product

### 2.3 Build BOM
- Page: `PLM > BOM Builder`
- Action:
  - Select collection -> select product -> open BOM modal
  - Add BOM lines from material list
  - Remove BOM line

### 2.4 Submit Package
- Page: `PLM > Submission Center`
- Action:
  - Submit version/package for approval flow

---

## 3) Finance Manager: Cost and Budget Configuration

### 3.1 Product Costing
- Page: `Finance > Costing Workbench`
- Action:
  - Open product card
  - Show BOM validation, scenario pricing, cost summary in modal

### 3.2 Budget Setup (Per Collection)
- Page: `Finance > Budget Planner`
- Action:
  - Use searchable collection picker/table-first flow
  - Show `Total BOM Cost` auto-loaded and read-only

### 3.3 Submit to Admin
- Page: `Finance > Submission to Admin`
- Action:
  - Show Pending/Approved/Disapproved tabs
  - Submit finance package

---

## 4) Admin: Approval / Disapproval and Control

### 4.1 Approval Decisions
- Page: `Admin > Approval Inbox`
- Action:
  - Open `Version Compare`
  - Open `Details & Decision`
  - Approve one request
  - Disapprove one request (with reason)

### 4.2 Operational Oversight
- Pages:
  - `Version Control`
  - `Inventory Allocation`
  - `Restock Queue`
  - `Exception Center`
- Action:
  - Show status and action workflows

### 4.3 Notifications
- Location: top-right bell in admin navbar
- Action:
  - Open bell dropdown
  - Show unread badge and message list

---

## 5) Production Manager: Run + Batch Execution

### 5.1 Start Production Run
- Page: `Production > Production Queue`
- Action:
  - Open details (design photo + instructions + BOM)
  - Click `Start Run`, set schedule and owner

### 5.2 Scheduler Sync Trigger
- Page: `Production > Run Scheduler`
- Demo point:
  - Show run auto-created/updated from Production Queue action

### 5.3 Batch and Handoff
- Pages:
  - `Batch Management`
  - `Handoff to QA`
- Action:
  - Create batch
  - Submit batch to QA from row action modal with notes/context

---

## 6) Branch Manager: Inventory to Stock-In

### 6.1 Inventory Monitoring
- Page: `Branch > Inventory`
- Action:
  - Use tabs (`All`, `Healthy`, `Low`)
  - In `Low`, click `Request Restock` per row
  - Submit modal form (routes to admin)

### 6.2 Restock Request List
- Page: `Branch > Restock Request`
- Action:
  - Show all submitted requests
  - Use `TableToolbar` search/filter
  - Open eye icon details modal

### 6.3 Request Tracking
- Page: `Branch > Request Tracker`
- Action:
  - Show lifecycle stages and ETA visibility
  - Open details modal

### 6.4 Receiving / Stock-In
- Page: `Branch > Receiving`
- Action:
  - Filter incoming records
  - Click `Confirm Receipt`
  - Enter received qty + damaged/missing + notes
  - Save and show status update (`Received` or `Discrepancy Logged`)

---

## 7) Reports and Summary

### Show role-specific reports
- `Super Admin Reports/Audit-related pages`
- `Admin Reports`
- `Finance Reports`
- `Production Reports`
- `Branch Reports`

### Demo point
- Consistent UI hierarchy
- Top-right generate/export actions
- QuickChart visual summary

---

## B. Reverse Flow (Vice Versa: Stock-In Back to Origin)

Use this when someone asks: “Where did this stock-in come from?”

1. Start at `Branch > Receiving`
   - Pick a received/discrepancy record
2. Open `Branch > Request Tracker`
   - Trace transfer reference + request status history
3. Open `Branch > Restock Request`
   - View original request payload (qty, priority, note, requester)
4. Go to `Branch > Inventory`
   - Show low stock trigger context that initiated request
5. Move to `Admin > Approval Inbox / Restock Queue`
   - Show where request was approved/disapproved and rationale
6. Move to `Finance > Submission to Admin` (if budget-linked)
   - Show budget package and approval state
7. Move to `PLM > BOM / Product setup` (if product root-cause needed)
   - Trace material/product definition origin
8. Finish at `Super Admin`
   - Show branch/warehouse/user setup that enabled the whole transaction chain

---

## C. Trigger/Automation Highlights to Mention

- Branch low-stock action -> creates restock request record
- Restock request -> visible in list/tracker with statuses
- Admin decisions -> reflected in downstream tracking states
- Production queue `Start Run` -> scheduler auto-sync
- Batch created -> appears in handoff flow
- Receiving confirmation -> updates receiving status and discrepancy state
- Shared localStorage data model keeps cross-page consistency in frontend-only demo mode

---

## D. Quick Demo Script (20-30 min)

1. Super Admin: create warehouse + branch + users
2. PLM: create material/product/BOM and submit
3. Finance: configure budget and submit
4. Admin: approve one, disapprove one
5. Production: start run, show scheduler sync
6. Branch: low stock -> request restock -> track -> receive stock-in
7. Reports: show role dashboards/reports and export controls

---

## E. Optional Q&A Anchor Lines

- **Where is CRUD shown?** User management, branch/warehouse, materials, products, versions, batches, requests.
- **Where are approvals/disapprovals shown?** Admin Approval Inbox + decision modals.
- **Where are notifications shown?** Admin topbar bell dropdown.
- **Where is stock-in shown?** Branch Receiving with discrepancy capture.
- **Can we trace backward?** Yes, via Receiving -> Tracker -> Request -> Inventory -> Admin decision -> upstream setup.

