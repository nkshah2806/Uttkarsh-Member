import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Printer, Download, Share2, Loader2 } from "lucide-react";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";
import {
  openReportForPdfSave,
  prepareWhatsAppPdfShare,
} from "./reportPdfUtils";

export default function PDFReportViewer() {
  const { visitId } = useParams();
  const { t, i18n } = useTranslation();

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
    async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.post(
          `v1/visits/${visitId}/generate-pdf`,
          {
            lang: i18n.language,
          }
        );
        if (!isMountedRef.current) return;
        setReportHtml(res.data.html);
        setReportId(res.data.report_id);
      } catch (err) {
        if (isMountedRef.current) {
          toast.error(t("demo.pdfReportViewer.toastCompileFailed"));
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [visitId, i18n.language, t]
  );

  useEffect(() => {
    generateReport();
  }, [generateReport]);

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
      toast.error(t("demo.pdfReportViewer.toastNotReady"));
      return;
    }
    setPdfBusy(true);
    try {
      const win = openReportForPdfSave(reportHtml, reportTitle);
      if (!win) {
        toast.error(t("demo.pdfReportViewer.toastPopupBlocked"));
      } else {
        toast.success(t("demo.pdfReportViewer.toastSaveAsPdf"));
      }
    } catch (err) {
      toast.error(t("demo.pdfReportViewer.toastDownloadFailed"));
    } finally {
      setPdfBusy(false);
    }
  };

  // Same complete PDF + predefined WhatsApp message (preserved from backend).
  const handleWhatsApp = async () => {
    if (pdfBusy) return; // prevent duplicate clicks while generating
    if (loading || !reportId || !reportHtml) {
      toast.error(t("demo.pdfReportViewer.toastNotReady"));
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
        toast.success(t("demo.pdfReportViewer.toastWhatsappReady"));
      } else {
        toast.error(t("demo.pdfReportViewer.toastPopupBlocked"));
      }
    } catch (err) {
      toast.error(t("demo.pdfReportViewer.toastWhatsappFailed"));
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-emerald-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("demo.pdfReportViewer.headerLabel")}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{t("demo.pdfReportViewer.visitLabel", { id: visitId?.slice(-6).toUpperCase() })}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-4 w-4" /> {t("demo.pdfReportViewer.print")}
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
            {t("demo.pdfReportViewer.downloadPdf")}
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
            {t("demo.pdfReportViewer.shareWhatsapp")}
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
          <Loader size={40} label={t("demo.pdfReportViewer.compiling")} style={{ flexDirection: "column" }} />
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-lg border overflow-hidden max-w-4xl mx-auto">
          <iframe
            title={t("demo.pdfReportViewer.iframeTitle")}
            srcDoc={reportHtml}
            className="w-full border-0"
            style={{ height: "80vh", minHeight: 600 }}
          />
        </div>
      )}
    </div>
  );
}
