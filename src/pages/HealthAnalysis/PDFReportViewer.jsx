import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Printer, Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  openReportForPdfSave,
  prepareWhatsAppPdfShare,
} from "./reportPdfUtils";

export default function PDFReportViewer() {
  const { visitId } = useParams();
  const { lang, t } = useLanguage();

  const [reportLang, setReportLang] = useState(lang);
  const [reportHtml, setReportHtml] = useState("");
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const generateReport = useCallback(
    async (selectedLang) => {
      try {
        setLoading(true);
        const res = await axiosInstance.post(
          `v1/visits/${visitId}/generate-pdf`,
          {
            lang: selectedLang,
          }
        );
        if (!isMountedRef.current) return;
        setReportHtml(res.data.html);
        setReportId(res.data.report_id);
      } catch (err) {
        if (isMountedRef.current) {
          toast.error(t("failedCompileReport"));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [visitId]
  );

  useEffect(() => {
    generateReport(reportLang);
  }, [generateReport, reportLang]);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(reportHtml);
    win.document.close();

    // Inject print-friendly styles to reduce large white margins and set page size
    const injectPrintStyles = () => {
      try {
        const style = win.document.createElement("style");
        style.innerHTML = `@page { size: A4; margin: 10mm; } body { margin: 0; } .report-container, .report { width: 190mm; margin: 0 auto; }`;
        win.document.head && win.document.head.appendChild(style);
      } catch (e) {
        // ignore if injection fails
      }
    };

    win.focus();
    // give the window a short moment to render, then inject styles and print
    setTimeout(() => {
      injectPrintStyles();
      setTimeout(() => win.print(), 200);
    }, 350);
  };

  const reportTitle = visitId
    ? `Quantum-Health-Report-${visitId.slice(-6).toUpperCase()}`
    : "Quantum-Health-Report";

  // Single source of truth: the compiled report HTML (same as the preview).
  const handleDownloadPdf = async () => {
    if (pdfBusy) return; // prevent duplicate clicks while generating
    if (loading || !reportHtml) {
      toast.error(t("reportNotReady"));
      return;
    }
    setPdfBusy(true);
    try {
      const win = openReportForPdfSave(reportHtml, reportTitle);
      if (!win) {
        toast.error(t("printBlocked"));
      } else {
        toast.success(t("saveAsPdfHint"));
      }
    } catch (err) {
      toast.error(t("failedOpenPdf"));
    } finally {
      setPdfBusy(false);
    }
  };

  // Same complete PDF + predefined WhatsApp message (preserved from backend).
  const handleWhatsApp = async () => {
    if (pdfBusy) return; // prevent duplicate clicks while generating
    if (loading || !reportId || !reportHtml) {
      toast.error(t("reportNotReady"));
      return;
    }
    setPdfBusy(true);
    try {
      const started = await prepareWhatsAppPdfShare({
        reportHtml,
        docTitle: reportTitle,
        getWhatsAppUrl: async () => {
          const res = await axiosInstance.post(
            `v1/visits/reports/${reportId}/share/whatsapp`
          );
          return res.data.whatsappUrl;
        },
      });
      if (started) {
        toast.success(t("pdfGeneratedWhatsApp"));
      } else {
        toast.error(t("printBlocked"));
      }
    } catch (err) {
      toast.error(t("failedWhatsAppLink"));
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-indigo-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("quantumHealthReport")}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{t("visitNumber").replace("{id}", visitId?.slice(-6).toUpperCase())}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setReportLang("en")}
              className={`px-3 py-1 rounded font-semibold transition-all ${reportLang === "en"
                ? "bg-white dark:bg-indigo-600 dark:text-white text-indigo-600 shadow"
                : "text-slate-500"
                }`}
            >
              English
            </button>
            <button
              onClick={() => setReportLang("hi")}
              className={`px-3 py-1 rounded font-semibold transition-all ${reportLang === "hi"
                ? "bg-white dark:bg-indigo-600 dark:text-white text-indigo-600 shadow"
                : "text-slate-500"
                }`}
            >
              हिंदी
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-4 w-4" /> {t("printView")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={pdfBusy || loading || !reportHtml}
          >
            {pdfBusy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-4 w-4" />
            )}
            {t("downloadPDF")}
          </Button>
          <Button
            size="sm"
            onClick={handleWhatsApp}
            disabled={pdfBusy || loading || !reportId || !reportHtml}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {pdfBusy ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-1.5 h-4 w-4" />
            )}
            {t("shareWhatsApp")}
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">
            {reportLang === "hi" ? t("compilingReportHi") : t("compilingReport")}
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-lg border overflow-hidden max-w-4xl mx-auto">
          <iframe
            title={t("reportPreview")}
            srcDoc={reportHtml}
            className="w-full border-0"
            style={{ height: "80vh", minHeight: 600 }}
          />
        </div>
      )}
    </div>
  );
}
