// TabBar.tsx - horizontal tab switcher with icons and optional count badges

import React from "react";
import type { LucideIcon } from "lucide-react";

export interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div
      className="bg-slate-100/80 p-1.5 rounded-full w-full md:w-fit inline-flex overflow-x-auto max-w-full"
      role="tablist"
      aria-label="Content tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 md:flex-none min-w-[120px] flex items-center justify-center gap-2
              px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200
              ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }
            `}
          >
            <Icon
              size={14}
              className={isActive ? "text-indigo-600" : "text-slate-400"}
              aria-hidden="true"
            />

            {tab.label}

            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
