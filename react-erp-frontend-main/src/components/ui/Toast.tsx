// Toast.tsx - success/error notification that auto-dismisses after 4s

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      icon: <CheckCircle2 className="text-emerald-600" size={16} />,
      tone: "from-emerald-500/15 to-emerald-500/0",
      iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      label: "text-emerald-700",
      bar: "bg-emerald-500",
    },
    error: {
      icon: <XCircle className="text-rose-600" size={16} />,
      tone: "from-rose-500/15 to-rose-500/0",
      iconWrap: "bg-rose-50 text-rose-600 ring-rose-100",
      label: "text-rose-700",
      bar: "bg-rose-500",
    },
  };

  const style = styles[type];

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 animate-in slide-in-from-right-8 fade-in duration-300">
      <div
        role="status"
        aria-live="polite"
        className="relative w-[420px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_12px_34px_-16px_rgba(15,23,42,0.5)] backdrop-blur supports-[backdrop-filter]:bg-white/85"
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${style.tone}`} />

        <div className="relative flex items-start gap-3 px-3.5 py-3.5 pr-10">
          <div
            className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ${style.iconWrap}`}
            aria-hidden="true"
          >
            {style.icon}
          </div>

          <div className="min-w-0">
            <p className={`text-[12px] font-semibold leading-4 ${style.label}`}>
              {type === "success" ? "Success" : "Error"}
            </p>
            <p className="mt-1 text-[12px] leading-[1.35] text-slate-600 break-words">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close notification"
          title="Close notification"
          className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={14} />
        </button>

        <div
          className={`absolute bottom-0 left-0 h-[2px] w-full origin-left opacity-60 ${style.bar} animate-[shrink_4s_linear_forwards]`}
        />
      </div>
    </div>
  );
};

export default Toast;
