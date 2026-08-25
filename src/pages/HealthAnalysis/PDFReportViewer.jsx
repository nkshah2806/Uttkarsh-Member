import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Printer, Share2, Globe, Download } from "lucide-react";
import { toast } from "sonner";

export default function PDFReportViewer() {
  const { visitId } = useParams();
  const { lang } = useLanguage();

  const [reportLang, setReportLang] = useState(lang);
  const [reportHtml, setReportHtml] = useState("");
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport(reportLang);
  }, [visitId, reportLang]);

  const generateReport = async (selectedLang) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(`v1/visits/${visitId}/generate-pdf`, {
        lang: selectedLang,
      });
      setReportHtml(res.data.html);
      setReportId(res.data.report_id);
    } catch (err) {
      toast.error("Failed to compile report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleWhatsApp = async () => {
    if (!reportId) return;
    try {
      const res = await axiosInstance.post(`v1/visits/reports/${reportId}/share/whatsapp`);
      window.open(res.data.whatsappUrl, "_blank");
    } catch (err) {
      toast.error("Failed to generate WhatsApp link");
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-indigo-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quantum Health Report</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">Visit #{visitId?.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setReportLang("en")}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                reportLang === "en"
                  ? "bg-white dark:bg-indigo-600 dark:text-white text-indigo-600 shadow"
                  : "text-slate-500"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setReportLang("hi")}
              className={`px-3 py-1 rounded font-semibold transition-all ${
                reportLang === "hi"
                  ? "bg-white dark:bg-indigo-600 dark:text-white text-indigo-600 shadow"
                  : "text-slate-500"
              }`}
            >
              हिंदी
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-4 w-4" /> Print
          </Button>
          <Button size="sm" onClick={handleWhatsApp} className="bg-emerald-600 hover:bg-emerald-700">
            <Share2 className="mr-1.5 h-4 w-4" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">
            {reportLang === "hi" ? "रिपोर्ट तैयार हो रही है..." : "Compiling your report..."}
          </p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-lg border overflow-hidden max-w-4xl mx-auto">
          <iframe
            title="Report Preview"
            srcDoc={reportHtml}
            className="w-full border-0"
            style={{ height: "80vh", minHeight: 600 }}
          />
        </div>
      )}
    </div>
  );
}
