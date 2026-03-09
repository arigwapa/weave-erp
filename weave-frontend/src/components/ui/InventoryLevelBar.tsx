// InventoryLevelBar.tsx - stock level bar, green/amber/red vs minimum threshold

import React from "react";

interface InventoryLevelBarProps {
  current: number;
  minimum: number;
  height?: string;
  showLabels?: boolean;
}

const InventoryLevelBar: React.FC<InventoryLevelBarProps> = ({
  current,
  minimum,
  height = "h-1.5",
  showLabels = false,
}) => {
  // 50% bar = at minimum, 100% = 2x minimum or above
  const ratio = minimum > 0 ? current / minimum : current > 0 ? 2 : 0;
  const percent = Math.min(100, Math.max(0, ratio * 50));

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700 dark:text-emerald-400";
  let statusLabel = "Normal";

  if (current <= 0) {
    barColor = "bg-rose-500";
    textColor = "text-rose-700 dark:text-rose-400";
    statusLabel = "Out of Stock";
  } else if (current <= minimum) {
    barColor = "bg-amber-500";
    textColor = "text-amber-700 dark:text-amber-400";
    statusLabel = "Low Stock";
  }

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            {current} / {minimum} min
          </span>
          <span className={`text-[10px] font-bold ${textColor}`}>
            {statusLabel}
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={minimum * 2}
        />
      </div>
    </div>
  );
};

export default InventoryLevelBar;
