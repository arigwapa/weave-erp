import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, LogOut, Menu, ChevronsLeft, ChevronsRight } from "lucide-react";
import Topbar from "../components/Topbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import BranchUserSidebar from "../components/BranchUserSidebar";

interface BranchUserLayoutProps {
  children: React.ReactNode;
}

const SEGMENT_LABELS: Record<string, string> = {
  branch: "Branch Portal",
  dashboard: "Branch Dashboard",
  inventory: "Branch Inventory",
  "restock-request": "Restock Request",
  "request-tracker": "Request Tracker",
  receiving: "Receiving",
  reports: "Branch Reports",
  profile: "Profile",
};

const BranchUserLayout: React.FC<BranchUserLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] dark:bg-slate-950">
      <BranchUserSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${isSidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-72"}`}
      >
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 pl-0 pr-4 sm:pr-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronsRight size={18} />
              ) : (
                <ChevronsLeft size={18} />
              )}
            </button>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Link
                to="/branch/dashboard"
                className="hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <Home size={16} />
              </Link>

              {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                const name =
                  SEGMENT_LABELS[value] ??
                  value.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

                return (
                  <div key={to} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-400" />
                    {isLast ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200 pointer-events-none">
                        {name}
                      </span>
                    ) : (
                      <Link to={to} className="hover:text-indigo-600 transition-colors">
                        {name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Topbar />
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-500/40 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="animate-page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default BranchUserLayout;
