import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Truck,
  PackageCheck,
  BarChart3,
  User,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import BrandLogo from "./ui/BrandLogo";
import weaveLogo from "../assets/Weave Logo.png";

interface BranchUserSidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const menuGroups = [
  {
    label: "Primary Navigation",
    items: [
      { icon: LayoutDashboard, label: "Branch Dashboard", path: "/branch/dashboard" },
      { icon: Boxes, label: "Branch Inventory", path: "/branch/inventory" },
      { icon: ClipboardList, label: "Restock Request", path: "/branch/restock-request" },
      { icon: Truck, label: "Request Tracker", path: "/branch/request-tracker" },
      { icon: PackageCheck, label: "Receiving", path: "/branch/receiving" },
      { icon: BarChart3, label: "Branch Reports", path: "/branch/reports" },
    ],
  },
];

const BranchUserSidebar: React.FC<BranchUserSidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen bg-white dark:bg-slate-900
          flex flex-col overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-[72px]" : "w-72"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100"
            }`}
          >
            <BrandLogo role="branch-admin" roleLabel="Branch" />
          </div>

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

          <button
            onClick={onCloseMobile}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
          <h3
            className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 transition-opacity duration-200 whitespace-nowrap ${
              isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Branch Manager
          </h3>

          {menuGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h3
                className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 transition-opacity duration-200 whitespace-nowrap ${
                  isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
                }`}
              >
                {group.label}
              </h3>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
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
          ))}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h3
              className={`text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-3 transition-opacity duration-200 whitespace-nowrap ${
                isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Account
            </h3>

            <div className="space-y-1">
              <NavLink
                to="/branch/profile"
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
        </nav>
      </aside>
    </>
  );
};

export default BranchUserSidebar;
