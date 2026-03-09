// ReportCard.tsx - card with header + built-in PDF export via html2canvas

import React, { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Download, Loader2 } from "lucide-react";
import { exportElementAsPdf } from "../../lib/pdfExport";

interface ReportCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  onExport?: () => void;
  exportLabel?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  icon: Icon,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50 dark:bg-indigo-900/30",
  children,
  onExport,
  exportLabel = "Export",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      await exportElementAsPdf(cardRef.current, title);
    } catch {
      // silent fallback
    } finally {
      setExporting(false);
    }
    onExport?.();
  };

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-left cursor-pointer"
        >
          {exporting ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download size={12} />
              {exportLabel}
            </>
          )}
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default ReportCard;
