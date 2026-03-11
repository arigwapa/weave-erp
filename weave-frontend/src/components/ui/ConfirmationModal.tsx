// ConfirmationModal.tsx - confirm/cancel dialog, portaled to body
// "primary" = blue, "danger" = red for destructive actions

import { createPortal } from "react-dom";
import { Archive, CircleHelp, Save, Trash2, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  variant?: "primary" | "danger";
  actionType?: "archive" | "delete" | "save" | "default";
  confirmText?: string;
  cancelText?: string;
}

type ResolvedActionType = "archive" | "delete" | "save" | "default";

function resolveActionType(
  title: string,
  message: string,
  confirmText: string | undefined,
  variant: "primary" | "danger",
  actionType?: ConfirmationModalProps["actionType"],
): ResolvedActionType {
  if (actionType) return actionType;
  const combined = `${title} ${message} ${confirmText ?? ""}`.toLowerCase();
  if (combined.includes("archive")) return "archive";
  if (combined.includes("delete") || combined.includes("remove")) return "delete";
  if (combined.includes("save") || combined.includes("submit") || combined.includes("create") || combined.includes("update")) return "save";
  if (variant === "danger") return "delete";
  return "default";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "primary",
  actionType,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const resolvedType = resolveActionType(title, message, confirmText, variant, actionType);

  const config = {
    archive: {
      icon: <Archive className="text-amber-600" size={20} />,
      iconWrap: "bg-amber-100 ring-amber-50",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
      titleColor: "text-slate-900",
      defaultConfirmText: "Archive",
    },
    delete: {
      icon: <Trash2 className="text-rose-600" size={20} />,
      iconWrap: "bg-rose-100 ring-rose-50",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white",
      titleColor: "text-slate-900",
      defaultConfirmText: "Delete",
    },
    save: {
      icon: <Save className="text-blue-600" size={20} />,
      iconWrap: "bg-blue-100 ring-blue-50",
      confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
      titleColor: "text-slate-900",
      defaultConfirmText: "Save",
    },
    default: {
      icon: <CircleHelp className="text-indigo-600" size={20} />,
      iconWrap: "bg-indigo-100 ring-indigo-50",
      confirmBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
      titleColor: "text-slate-900",
      defaultConfirmText: "Confirm",
    },
  }[resolvedType];

  const finalConfirmText = confirmText === "Confirm" ? config.defaultConfirmText : confirmText;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[24px] border border-white/60 bg-white p-5 shadow-[0_20px_40px_-22px_rgba(15,23,42,0.55)]">
        <div className="mb-3 flex justify-end">
          <button
            aria-label="Close Modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-5 flex flex-col items-center text-center">
          <div
            className={`mb-4 grid h-12 w-12 place-items-center rounded-full ring-8 ${config.iconWrap}`}
            aria-hidden="true"
          >
            {config.icon}
          </div>
          <h3 className={`text-[14px] font-semibold leading-tight ${config.titleColor}`}>
            {title}
          </h3>
          <p className="mt-3 max-w-lg text-[12px] font-normal leading-5 text-slate-500">
            {message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onClose}
            className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-[12px] font-normal text-slate-700 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`h-10 rounded-xl px-4 text-[12px] font-normal shadow-sm transition-colors ${config.confirmBtn}`}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
