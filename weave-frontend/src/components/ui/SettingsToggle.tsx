// SettingsToggle.tsx - labeled on/off row for settings pages

import React from "react";
import ToggleSwitch from "./ToggleSwitch";

export interface SettingsToggleProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  description?: string;
}

const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  checked,
  onChange,
  description,
}) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex-1 min-w-0 pr-4">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {description && (
        <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
    <ToggleSwitch
      active={checked}
      onToggle={() => onChange(!checked)}
      label={`Toggle ${label}`}
    />
  </div>
);

export default SettingsToggle;
