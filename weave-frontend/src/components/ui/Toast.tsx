// Toast.tsx - success/error notification that auto-dismisses after 4s

import React, { useEffect } from "react";
import { AlertTriangle, Check, CircleX, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "warning" | "error";
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
      title: "Success!",
      icon: <Check className="text-emerald-500" size={16} strokeWidth={3} />,
      container: "border-emerald-200 bg-emerald-50/90",
      iconWrap: "bg-emerald-200/70",
      titleColor: "text-emerald-900",
      messageColor: "text-emerald-800",
      closeColor: "text-emerald-400 hover:text-emerald-600",
    },
    warning: {
      title: "Warning!",
      icon: <AlertTriangle className="text-amber-500" size={16} strokeWidth={2.6} />,
      container: "border-amber-200 bg-amber-50/90",
      iconWrap: "bg-amber-200/60",
      titleColor: "text-amber-900",
      messageColor: "text-amber-800",
      closeColor: "text-amber-400 hover:text-amber-600",
    },
    error: {
      title: "Error!",
      icon: <CircleX className="text-rose-500" size={16} strokeWidth={2.6} />,
      container: "border-rose-200 bg-rose-50/90",
      iconWrap: "bg-rose-200/60",
      titleColor: "text-rose-900",
      messageColor: "text-rose-800",
      closeColor: "text-rose-400 hover:text-rose-600",
    },
  };

  const style = styles[type];

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[130] flex flex-col gap-3 animate-in slide-in-from-right-8 fade-in duration-300">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto relative w-[380px] max-w-[calc(100vw-2.5rem)] rounded-2xl border px-4 py-3.5 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.35)] backdrop-blur ${style.container}`}
      >
        <div className="relative flex items-start gap-3 pr-8">
          <div
            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${style.iconWrap}`}
            aria-hidden="true"
          >
            {style.icon}
          </div>

          <div className="min-w-0">
            <p className={`text-[12px] font-semibold leading-4 ${style.titleColor}`}>
              {style.title}
            </p>
            <p className={`mt-0.5 text-[12px] font-normal leading-[1.35] break-words ${style.messageColor}`}>
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close notification"
          title="Close notification"
          className={`absolute right-2.5 top-2.5 rounded-lg p-1 transition-colors ${style.closeColor}`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
