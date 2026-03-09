import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Logs,
  Settings,
  Boxes,
  PackageSearch,
  Archive,
  ClipboardList,
  ShieldCheck,
  BarChart3,
  UserSquare2,
  Factory,
  ListChecks,
  Cog,
  FlaskConical,
  CheckSquare,
  FileWarning,
  Warehouse,
  Package2,
  Truck,
} from "lucide-react";
import type { AppRole } from "./authToken";

export type SidebarLink = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const sidebarConfig: Record<AppRole, SidebarLink[]> = {
  Superadmin: [
    { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
    { label: "User Management", path: "/superadmin/users", icon: Users },
    { label: "Branch Management", path: "/superadmin/branches", icon: Building2 },
    { label: "System Logs", path: "/superadmin/logs", icon: Logs },
    { label: "Settings", path: "/superadmin/settings", icon: Settings },
  ],
  "Product Manager": [
    { label: "Dashboard", path: "/pm/dashboard", icon: LayoutDashboard },
    { label: "Collections & BOM", path: "/pm/collections", icon: Boxes },
    { label: "Master Material List", path: "/pm/materials", icon: PackageSearch },
    { label: "QA Defect Inbox", path: "/pm/defects", icon: FileWarning },
    { label: "Archives", path: "/pm/archives", icon: Archive },
  ],
  Admin: [
    { label: "Executive Dashboard", path: "/admin/dashboard", icon: ShieldCheck },
    { label: "Pending Approvals", path: "/admin/approvals", icon: ListChecks },
    { label: "Master Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Company Roster", path: "/admin/roster", icon: UserSquare2 },
  ],
  "Production Manager": [
    { label: "Production Dashboard", path: "/production/dashboard", icon: LayoutDashboard },
    { label: "New Work Orders", path: "/production/orders", icon: ClipboardList },
    { label: "Active Batches", path: "/production/batches", icon: Factory },
    { label: "Work Centers", path: "/production/centers", icon: Cog },
  ],
  PQA: [
    { label: "Quality Dashboard", path: "/pqa/dashboard", icon: LayoutDashboard },
    { label: "Testing Queue", path: "/pqa/queue", icon: FlaskConical },
    { label: "Batch Inspection", path: "/pqa/inspection", icon: CheckSquare },
    { label: "Defect Reports", path: "/pqa/reports", icon: FileWarning },
  ],
  "Branch Manager": [
    { label: "Warehouse Dashboard", path: "/branch/dashboard", icon: Warehouse },
    { label: "My Inventory", path: "/branch/inventory", icon: Package2 },
    { label: "Request Restock", path: "/branch/restock", icon: ClipboardList },
    { label: "Inbound Deliveries", path: "/branch/deliveries", icon: Truck },
  ],
};
