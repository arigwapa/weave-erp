// BudgetUtilizationBar.tsx - spent vs total bar, green/amber/red by threshold

import React from "react";

interface BudgetUtilizationBarProps {
  spent: number;
  total: number;
  height?: string;
  showLabels?: boolean;
  currency?: string;
}

const formatCurrency = (value: number, currency: string) => {
  if (value >= 1_000_000) return `${currency}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${currency}${(value / 1_000).toFixed(0)}K`;
  return `${currency}${value.toLocaleString()}`;
};

const BudgetUtilizationBar: React.FC<BudgetUtilizationBarProps> = ({
  spent,
  total,
  height = "h-1.5",
  showLabels = false,
  currency = "₱",
}) => {
  const percent = total > 0 ? Math.min(100, Math.max(0, (spent / total) * 100)) : 0;

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700 dark:text-emerald-400";
  let statusLabel = "On Track";

  if (percent > 90) {
    barColor = "bg-rose-500";
    textColor = "text-rose-700 dark:text-rose-400";
    statusLabel = "Over Limit";
  } else if (percent > 70) {
    barColor = "bg-amber-500";
    textColor = "text-amber-700 dark:text-amber-400";
    statusLabel = "Approaching";
  }

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {formatCurrency(spent, currency)} / {formatCurrency(total, currency)}
          </span>
          <span className={`text-[10px] font-bold ${textColor}`}>
            {percent.toFixed(0)}% · {statusLabel}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default BudgetUtilizationBar;
