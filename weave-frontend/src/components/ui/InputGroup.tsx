// InputGroup.tsx - form input with label, optional icon, and password toggle

import React, { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

interface InputGroupProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPassword?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}
const InputGroup: React.FC<InputGroupProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  isPassword = false,
  disabled = false,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5 mb-5 group">
      <label
        htmlFor={id}
        className={`text-xs font-semibold tracking-wide transition-colors duration-200 ${isFocused ? "text-indigo-600" : "text-slate-500"}`}
      >
        {label}
      </label>

      <div
        className={`relative flex items-center bg-white/50 backdrop-blur-sm border rounded-xl transition-all duration-300 ${isFocused ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
      >
        {Icon && (
          <div className="pl-4 text-slate-400">
            <Icon size={18} />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full bg-transparent border-none py-3 px-3 text-slate-700 placeholder:text-slate-400 focus:outline-none text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputGroup;
