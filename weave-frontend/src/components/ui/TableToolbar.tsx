// TableToolbar.tsx - search bar + filter dropdown + optional add button

import React, { useRef, useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Filter, ChevronDown, Plus } from "lucide-react";
import PrimaryButton from "./PrimaryButton";

interface TableToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  onAdd?: () => void;
  addLabel?: string;
  filterLabel?: string;
  placeholder?: string;
  children?: React.ReactNode;
  inlineControls?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
  onAdd,
  addLabel = "Add Branch",
  filterLabel = "Filters",
  placeholder = "Search...",
  children,
  inlineControls,
}) => {
  const filterBtnRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const reposition = useCallback(() => {
    if (filterBtnRef.current) {
      const r = filterBtnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left });
    }
  }, []);

  useEffect(() => {
    if (!isFilterOpen) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isFilterOpen, reposition]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
      <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
        <div className="relative group flex-1 sm:flex-none">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors"
            size={14}
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={placeholder}
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full outline-none focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:border-slate-400 dark:focus:border-slate-500 transition-all placeholder:text-slate-400 dark:text-slate-200"
          />
        </div>

        <div className="relative" ref={filterBtnRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              isFilterOpen
                ? "bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900 dark:border-white"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
            }`}
          >
            <Filter size={14} aria-hidden="true" />
            <span>{filterLabel}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${
                isFilterOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isFilterOpen &&
            createPortal(
              <div
                ref={dropdownRef}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700"
                style={{
                  position: "fixed",
                  top: pos.top,
                  left: pos.left,
                  minWidth: 192,
                  zIndex: 9999,
                }}
              >
                {children}
              </div>,
              document.body
            )}
        </div>

        {inlineControls}
      </div>

      {onAdd && (
        <div className="w-full sm:w-auto">
          <PrimaryButton
            onClick={onAdd}
            className="w-full sm:w-auto !rounded-full !py-2 !px-4 !text-xs shadow-md"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{addLabel}</span>
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};
