// useDateRangeFilter.ts - manages from/to date state for report filter bars
// works with DateRangeFilter component, supports presets like "last 7 days" etc.

import { useState, useCallback, useMemo } from "react";

export type DatePreset =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

const PRESET_LABELS: Record<DatePreset, string> = {
  today: "Today",
  last7: "Last 7 Days",
  last30: "Last 30 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
  custom: "Custom",
};

export const PRESET_OPTIONS = Object.entries(PRESET_LABELS).map(([value, label]) => ({
  value: value as DatePreset,
  label,
}));

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// turns a preset like "last7" into actual from/to date strings
function computeDates(preset: DatePreset): { from: string; to: string } {
  const now = new Date();
  const today = fmt(now);

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "last7":
      return { from: fmt(new Date(now.getTime() - 7 * 86_400_000)), to: today };
    case "last30":
      return { from: fmt(new Date(now.getTime() - 30 * 86_400_000)), to: today };
    case "thisMonth":
      return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    case "lastMonth": {
      // first and last day of previous month
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(first), to: fmt(last) };
    }
    case "custom":
    default:
      // fallback to last 7 days, user will pick their own dates
      return { from: fmt(new Date(now.getTime() - 7 * 86_400_000)), to: today };
  }
}

export function useDateRangeFilter(defaultPreset: DatePreset = "last7") {
  const initial = computeDates(defaultPreset);
  const [preset, setPresetState] = useState<DatePreset>(defaultPreset);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const isCustom = preset === "custom";

  // pick a preset and recalculate the dates (unless custom)
  const applyPreset = useCallback((p: DatePreset) => {
    setPresetState(p);
    if (p !== "custom") {
      const d = computeDates(p);
      setFrom(d.from);
      setTo(d.to);
    }
  }, []);

  const setPreset = useCallback((p: DatePreset) => applyPreset(p), [applyPreset]);

  const error = useMemo(() => {
    if (!from || !to) return "Date range is required.";
    if (from > to) return "From date must be before To date.";
    return null;
  }, [from, to]);

  const presetLabel = PRESET_LABELS[preset];

  return {
    preset,
    setPreset,
    from,
    // manual date edit flips to "custom" preset automatically
    setFrom: (v: string) => { setPresetState("custom"); setFrom(v); },
    to,
    setTo: (v: string) => { setPresetState("custom"); setTo(v); },
    isCustom,
    applyPreset,
    error,
    presetLabel,
  };
}
