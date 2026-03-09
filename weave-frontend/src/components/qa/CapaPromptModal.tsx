import { createPortal } from "react-dom";
import PrimaryButton from "../ui/PrimaryButton";
import SecondaryButton from "../ui/SecondaryButton";

type Props = {
  open: boolean;
  onCreateNow: () => void;
  onAutoCreateDraft: () => void;
  onSkip: () => void;
};

export function CapaPromptModal({ open, onCreateNow, onAutoCreateDraft, onSkip }: Props) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h3 className="text-base font-semibold text-slate-900">Rejected Inspection</h3>
        <p className="mt-2 text-sm text-slate-600">
          This inspection result is Rejected. Would you like to create a CAPA record now?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <SecondaryButton onClick={onSkip}>Later</SecondaryButton>
          <SecondaryButton onClick={onAutoCreateDraft}>Auto-create Draft</SecondaryButton>
          <PrimaryButton className="!w-auto !rounded-full !px-4 !py-2 !text-xs" onClick={onCreateNow}>
            Create CAPA
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
