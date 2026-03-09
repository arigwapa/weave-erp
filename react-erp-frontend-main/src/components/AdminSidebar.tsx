// AdminSidebar.tsx - Branch Admin nav panel (same pattern as Sidebar.tsx but scoped to one branch)

import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import {
  LayoutDashboard,
  Users,
  Inbox,
  GitBranch,
  Boxes,
  Truck,
  Siren,
  BarChart3,
  ListTodo,
  Milestone,
  History,
  ShieldCheck,
  LogOut,
  User,
  ChevronDown,
  X,
} from "lucide-react";

import BrandLogo from "./ui/BrandLogo";
import weaveLogo from "../assets/Weave Logo.png";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const menuGroups = [
  {
    label: "Primary Navigation",
    items: [
      {
        icon: LayoutDashboard,
        label: "Admin Dashboard",
        path: "/admin/dashboard",
      },
      {
        icon: Users,
        label: "User Management",
        path: "/admin/user-management",
      },
      {
        icon: Inbox,
        label: "Approval Inbox",
        path: "/admin/approval-inbox",
      },
      {
        icon: GitBranch,
        label: "Version Control",
        path: "/admin/version-control",
      },
      {
        icon: Boxes,
        label: "Inventory Allocation",
        path: "/admin/inventory-allocation",
      },
      {
        icon: Truck,
        label: "Restock Queue",
        path: "/admin/restock-queue",
      },
      {
        icon: Siren,
        label: "Exception Center",
        path: "/admin/exception-center",
      },
      { icon: BarChart3, label: "Reports", path: "/admin/reports" },
      { icon: ListTodo, label: "Task Inbox", path: "/admin/task-inbox" },
      {
        icon: Milestone,
        label: "Workflow Timeline",
        path: "/admin/workflow-timeline",
      },
      {
        icon: History,
        label: "Approvals History",
        path: "/admin/approvals-history",
      },
      {
        icon: ShieldCheck,
        label: "Audit Viewer",
        path: "/admin/audit-viewer",
      },
    ],
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed,
  onToggleCollapse: _onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    menuGroups.forEach((group) => {
      const hasActiveItem = group.items.some(
        (item) => location.pathname === item.path,
      );
      newExpanded[group.label] =
        hasActiveItem || expandedGroups[group.label] || false;
    });
    setExpandedGroups(newExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {/* mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900
          flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-72"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* logo area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          {/* full logo when expanded */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100"
            }`}
          >
            <BrandLogo role="branch-admin" branch="Manila" />
          </div>

          {/* icon-only when collapsed */}
          {isCollapsed && (
            <div className="w-full flex items-center justify-center">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden p-1 shrink-0">
                <img
                  src={weaveLogo}
                  alt="Weave Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* close btn, mobile only */}
          <button
            onClick={onCloseMobile}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* scrollable nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups[group.label] ?? false;
            const hasActiveItem = group.items.some(
              (item) => location.pathname === item.path,
            );

            return (
              <div key={group.label}>
                {/* group header toggle */}
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={isExpanded}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 group/header ${
                      hasActiveItem && !isExpanded
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  /* When collapsed, show a thin separator line */
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2" />
                )}

                {/* nav links */}
                <div
                  className={`space-y-1 overflow-hidden transition-all duration-200 ease-in-out ${
                    isCollapsed
                      ? "max-h-[500px] opacity-100 mt-1"
                      : isExpanded
                        ? "max-h-[500px] opacity-100 mt-1"
                        : "max-h-0 opacity-0 mt-0"
                  }`}
                >
                  {group.items.map((item, itemIdx) => (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) => `
                        flex items-center justify-between rounded-xl text-xs font-medium transition-all group
                        ${isCollapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                        ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                        }
                      `}
                    >
                      <div
                        className={`flex items-center truncate ${
                          isCollapsed ? "justify-center w-full" : "gap-3"
                        }`}
                      >
                        <item.icon size={16} className="shrink-0" />
                        <span
                          className={`truncate transition-opacity duration-200 ${
                            isCollapsed ? "hidden" : "block"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}

          {/* account section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3
              className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 transition-opacity duration-200 whitespace-nowrap ${
                isCollapsed
                  ? "opacity-0 h-0 mb-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              Account
            </h3>

            <div className="space-y-1">
              <NavLink
                to="/admin/profile"
                title={isCollapsed ? "Profile" : undefined}
                className={`flex items-center rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
                }`}
              >
                <User size={16} className="shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Profile
                </span>
              </NavLink>

              <button
                onClick={handleLogout}
                title={isCollapsed ? "Logout" : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left ${
                  isCollapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
                }`}
              >
                <LogOut size={16} className="shrink-0" />
                <span
                  className={`transition-opacity duration-200 ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Logout
                </span>
              </button>
            </div>
          </div>

          <div className="h-12"></div>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
