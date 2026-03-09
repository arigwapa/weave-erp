// DateRangeFilter.tsx - preset dropdown + manual from/to date pickers for report pages

import React from "react";
import { PRESET_OPTIONS, type DatePreset } from "../../hooks/useDateRangeFilter";

interface Props {
  preset: DatePreset;
  onPresetChange: (p: DatePreset) => void;
  from: string;
  onFromChange: (v: string) => void;
  to: string;
  onToChange: (v: string) => void;
  isCustom: boolean;
  error: string | null;
  children?: React.ReactNode;
}

const DATE_INPUT_CLS =
  "px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

const DateRangeFilter: React.FC<Props> = ({
  preset,
  onPresetChange,
  from,
  onFromChange,
  to,
  onToChange,
  isCustom,
  error,
  children,
}) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
      Report Filters
    </p>
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500">Period:</label>
        <select
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as DatePreset)}
          className={DATE_INPUT_CLS + " pr-8 cursor-pointer"}
        >
          {PRESET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500">From:</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className={DATE_INPUT_CLS}
          disabled={!isCustom}
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500">To:</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className={DATE_INPUT_CLS}
          disabled={!isCustom}
        />
      </div>

      {children}
    </div>

    {error && (
      <p className="mt-2 text-[11px] font-medium text-rose-600">{error}</p>
    )}
  </div>
);

export default DateRangeFilter;
