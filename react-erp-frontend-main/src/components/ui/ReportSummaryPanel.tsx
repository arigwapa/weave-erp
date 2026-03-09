// ReportSummaryPanel.tsx - chart grid + AI executive summary with PDF export

import React, { useState, useCallback, useEffect } from "react";
import {
  FileText,
  Download,
  Copy,
  Check,
  ImageIcon,
  Loader2,
} from "lucide-react";
import {
  getRejectionRateChartUrl,
  getTopDefectsChartUrl,
  getOutputVsWasteChartUrl,
  generateExecutiveReport,
} from "../../lib/analyticsApi";
import { exportSummaryReportPdf } from "../../lib/pdfExport";

interface Props {
  from: string;
  to: string;
  focusContext?: string;
}

const ReportSummaryPanel: React.FC<Props> = ({ from, to, focusContext }) => {
  const [chartUrls, setChartUrls] = useState<string[]>([]);
  const [chartsLoading, setChartsLoading] = useState(false);

  const [reportText, setReportText] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState("");
  const [focus, setFocus] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCharts = useCallback(async () => {
    if (!from || !to) return;
    setChartsLoading(true);
    setError("");
    try {
      const [r1, r2, r3] = await Promise.all([
        getRejectionRateChartUrl(from, to),
        getTopDefectsChartUrl(from, to),
        getOutputVsWasteChartUrl(from, to),
      ]);
      setChartUrls([r1.chartUrl, r2.chartUrl, r3.chartUrl]);
    } catch {
      setError("Failed to load charts.");
    } finally {
      setChartsLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  const handleGenerate = useCallback(async () => {
    setReportLoading(true);
    setError("");
    try {
      const fullFocus = [focusContext, focus].filter(Boolean).join(". ");
      const result = await generateExecutiveReport(from, to, fullFocus || undefined);
      setReportText(result.reportText);
      setGeneratedAt(new Date().toLocaleString());
    } catch {
      setError("Failed to generate executive report.");
    } finally {
      setReportLoading(false);
    }
  }, [from, to, focus, focusContext]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [reportText]);

  const handleExportPdf = useCallback(async () => {
    if (!reportText) {
      setError("Generate a report first before exporting.");
      return;
    }
    setPdfLoading(true);
    setError("");
    try {
      await exportSummaryReportPdf({
        from,
        to,
        generatedAt: generatedAt || new Date().toLocaleString(),
        reportText,
        chartUrls,
      });
    } catch {
      setError("Failed to export PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  }, [from, to, generatedAt, reportText, chartUrls]);

  const chartLabels = ["Weekly Rejection Rate", "Top 5 Defect Types", "Output vs Waste"];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <ImageIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analytics Charts</h3>
              <p className="text-[10px] text-slate-500">Live QuickChart visualizations for {from} — {to}</p>
            </div>
          </div>
          {chartsLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
        </div>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {chartUrls.length > 0
            ? chartUrls.map((url, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{chartLabels[i]}</p>
                  <img
                    src={url}
                    alt={chartLabels[i]}
                    className="w-full rounded-lg border border-slate-100 dark:border-slate-700 bg-white"
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                </div>
              ))
            : !chartsLoading && (
                <div className="col-span-3 py-8 text-center text-xs text-slate-400">
                  No chart data available for the selected range.
                </div>
              )}
          {chartsLoading && chartUrls.length === 0 && (
            <div className="col-span-3 py-8 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span className="text-xs text-slate-500">Loading charts…</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
              <FileText size={14} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Executive Summary</h3>
              <p className="text-[10px] text-slate-500">Gemini-powered report using live ERP analytics data</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Focus area (optional)… e.g. quality risks"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
            />
            <button
              onClick={handleGenerate}
              disabled={reportLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              {reportLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <FileText size={13} />
                  Generate Summary Report
                </>
              )}
            </button>
          </div>

          {reportLoading && !reportText && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 flex items-center justify-center gap-3">
              <Loader2 size={18} className="animate-spin text-indigo-500" />
              <span className="text-xs text-slate-500 font-medium">Analyzing ERP data and generating report…</span>
            </div>
          )}

          {reportText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {generatedAt && (
                  <span className="text-[10px] text-slate-400 font-medium">Last generated: {generatedAt}</span>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={handleExportPdf}
                    disabled={pdfLoading || !reportText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {pdfLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Exporting…
                      </>
                    ) : (
                      <>
                        <Download size={12} />
                        Export PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 max-h-[480px] overflow-y-auto">
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                  {reportText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSummaryPanel;
