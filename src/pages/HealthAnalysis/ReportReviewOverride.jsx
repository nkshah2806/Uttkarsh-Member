import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { FileCheck, CheckSquare, Square, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const CONTENT_TYPES = ["REPORT", "PROBLEM", "CAUSE", "PRECAUTION", "PATHYA", "PARHEJ", "MEDICINE", "DIET"];

const CONTENT_LABELS = {
  en: {
    REPORT: "Summary Report",
    PROBLEM: "Health Problems",
    CAUSE: "Causes",
    PRECAUTION: "Precautions",
    PATHYA: "Pathya (Do's)",
    PARHEJ: "Parhej (Don'ts)",
    MEDICINE: "Ayurvedic Medicines",
    DIET: "Diet Chart",
  },
  hi: {
    REPORT: "सारांश रिपोर्ट",
    PROBLEM: "स्वास्थ्य समस्याएं",
    CAUSE: "कारण",
    PRECAUTION: "सावधानियां",
    PATHYA: "पथ्य (क्या खाएं)",
    PARHEJ: "परहेज (क्या न खाएं)",
    MEDICINE: "आयुर्वेदिक औषधि",
    DIET: "आहार सारणी",
  },
};

export default function ReportReviewOverride() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selections, setSelections] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchAnalysis();
  }, [visitId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`v1/visits/${visitId}/auto-report`);
      const data = res.data.data;
      setAnalysisData(data);

      const initMap = {};
      const initExpanded = {};
      data.analyzed_items.forEach((item) => {
        initExpanded[item.parameter.id] = true;
        Object.values(item.content).forEach((arr) => {
          arr.forEach((c) => { initMap[c.id] = c.is_selected; });
        });
      });
      setSelections(initMap);
      setExpanded(initExpanded);
    } catch (err) {
      toast.error("Failed to load analysis results");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setSelections((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleExpanded = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleFinalize = async () => {
    try {
      setSaving(true);
      const payload = Object.entries(selections).map(([id, is_selected]) => ({
        parameter_master_content_id: id,
        is_selected,
      }));

      await axiosInstance.patch(`v1/visits/${visitId}/selected-content`, { selections: payload });
      toast.success("Selections saved. Generating report...");
      navigate(`/report-pdf/${visitId}`);
    } catch (err) {
      toast.error("Failed to save selections");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3 text-center">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500">Auto-analysis engine running...</p>
      </div>
    );
  }

  const selectedCount = Object.values(selections).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white shadow-md">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Auto-Analysis Engine</p>
          <h1 className="text-2xl font-bold mt-1">{t("autoReportTitle")}</h1>
          <p className="text-xs text-violet-200 mt-1">{t("prioritySelectNotice")}</p>
        </div>
        <Button
          onClick={handleFinalize}
          disabled={saving}
          className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5"
        >
          <FileCheck className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : t("generatePDF")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {[
          { label: "Parameters Scanned", value: analysisData?.total_parameters, color: "default" },
          { label: "Normal", value: analysisData?.normal_count, color: "emerald" },
          { label: "Abnormal", value: analysisData?.abnormal_count, color: "rose" },
          { label: "Items Selected", value: selectedCount, color: "indigo" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`rounded-xl border p-3 text-center shadow-sm ${
              color === "emerald" ? "bg-emerald-50 border-emerald-200" :
              color === "rose" ? "bg-rose-50 border-rose-200" :
              color === "indigo" ? "bg-indigo-50 border-indigo-200" :
              "bg-white dark:bg-slate-900"
            }`}
          >
            <p className={`text-2xl font-bold ${
              color === "emerald" ? "text-emerald-700" :
              color === "rose" ? "text-rose-700" :
              color === "indigo" ? "text-indigo-700" : ""
            }`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Abnormal Parameter Cards */}
      {analysisData?.analyzed_items.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center text-slate-400">
            <p className="text-lg font-semibold text-emerald-600">All Parameters Normal</p>
            <p className="text-sm mt-1">No abnormal values detected. Report will show a clean bill of health.</p>
            <Button onClick={handleFinalize} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              Generate Report <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {analysisData.analyzed_items.map((item) => {
            const param = item.parameter;
            const isOpen = expanded[param.id] !== false;
            return (
              <Card key={param.id} className="border-0 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleExpanded(param.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {param.code}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white">
                          {lang === "hi" ? param.name_hi : param.name_en}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          Normal: {param.normal_min}–{param.normal_max} {param.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                          item.result_type === "HIGH"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.result_type === "HIGH" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {item.result_type} · {item.raw_value}
                      </span>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <CardContent className="p-5 space-y-5">
                    {CONTENT_TYPES.map((ct) => {
                      const items = item.content[ct];
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={ct}>
                          <h4 className="text-xs font-bold uppercase text-indigo-600 tracking-wider mb-2">
                            {CONTENT_LABELS[lang]?.[ct] || ct}
                          </h4>
                          <div className="space-y-2">
                            {items.map((c) => {
                              const checked = selections[c.id] === true;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => toggle(c.id)}
                                  className={`flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer select-none transition-all ${
                                    checked
                                      ? "bg-indigo-50/80 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-700"
                                      : "bg-slate-50 border-slate-200 opacity-50 dark:bg-slate-900"
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {checked
                                      ? <CheckSquare className="h-4 w-4 text-indigo-600" />
                                      : <Square className="h-4 w-4 text-slate-400" />
                                    }
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white leading-snug">
                                      {lang === "hi" ? c.text_hi : c.text_en}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                      {lang === "hi" ? `EN: ${c.text_en}` : `HI: ${c.text_hi}`}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">
                                    P{c.priority}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom Finalize Bar */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          onClick={handleFinalize}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 py-3 shadow-lg rounded-xl"
        >
          <FileCheck className="mr-2 h-4 w-4" />
          {saving ? "Processing..." : t("generatePDF")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
