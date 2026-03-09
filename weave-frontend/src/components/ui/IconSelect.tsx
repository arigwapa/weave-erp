// IconSelect.tsx - custom select dropdown with optional icons per option

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface IconSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

export interface IconSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: IconSelectOption[];
  placeholder?: string;
}

const IconSelect: React.FC<IconSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const reposition = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left, width: r.width });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [isOpen, reposition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(t) &&
        (!dropdownRef.current || !dropdownRef.current.contains(t))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium bg-white dark:bg-slate-800 border rounded-xl outline-none transition-all duration-200 ${
          isOpen
            ? "border-slate-300 dark:border-slate-500 ring-2 ring-slate-300 dark:ring-slate-600 shadow-sm"
            : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
        }`}
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
          {selectedOption?.icon && (
            <selectedOption.icon size={14} className="text-slate-500 dark:text-slate-400" />
          )}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 9999,
            }}
            role="listbox"
          >
            <div className="p-1.5 max-h-48 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    value === option.value
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {option.icon && (
                    <option.icon
                      size={14}
                      className={
                        value === option.value
                          ? "text-slate-700 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-500"
                      }
                    />
                  )}

                  <span className="text-left flex-1 truncate">{option.label}</span>

                  {value === option.value && (
                    <Check
                      size={12}
                      className="ml-auto text-emerald-500"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default IconSelect;
