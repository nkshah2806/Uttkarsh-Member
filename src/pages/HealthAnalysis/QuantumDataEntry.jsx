import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { Activity, FileSpreadsheet, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export default function QuantumDataEntry() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [patient, setPatient] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRawText, setCsvRawText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    fetchData();
  }, [visitId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, pRes] = await Promise.all([
        axiosInstance.get(`v1/visits/${visitId}`),
        axiosInstance.get("v1/admin/parameters"),
      ]);

      setPatient(vRes.data.data.visit.patient_id);
      const params = pRes.data.data || [];
      setParameters(params);

      // Pre-fill existing results
      const map = {};
      (vRes.data.data.results || []).forEach((r) => {
        map[r.parameter_id._id || r.parameter_id] = r.raw_value;
      });
      setResultsMap(map);
    } catch (err) {
      toast.error("Failed to load scan data");
    } finally {
      setLoading(false);
    }
  };

  const computeStatus = (param, val) => {
    const num = Number(val);
    if (val === "" || val === undefined || isNaN(num)) return null;
    if (num < param.normal_min) return "LOW";
    if (num > param.normal_max) return "HIGH";
    return "NORMAL";
  };

  const handleSaveAndAnalyze = async () => {
    try {
      setSaving(true);
      const results = Object.entries(resultsMap)
        .filter(([_, v]) => v !== "" && !isNaN(Number(v)))
        .map(([parameter_id, raw_value]) => ({ parameter_id, raw_value: Number(raw_value) }));

      if (results.length === 0) {
        toast.error("Please enter at least one parameter value.");
        return;
      }

      await axiosInstance.post(`v1/visits/${visitId}/results`, { results });
      toast.success("Data saved! Running auto-analysis...");
      navigate(`/report-review/${visitId}`);
    } catch (err) {
      toast.error("Failed to save scan results");
    } finally {
      setSaving(false);
    }
  };

  const handleCSVImport = async () => {
    const rows = csvRawText
      .trim()
      .split("\n")
      .reduce((acc, line) => {
        const parts = line.split(/[,;\t]/);
        if (parts.length >= 2) {
          const code = parts[0].trim().toUpperCase();
          const val = parseFloat(parts[1].trim());
          if (code && !isNaN(val)) acc.push({ code, raw_value: val });
        }
        return acc;
      }, []);

    if (!rows.length) {
      toast.error("No valid rows found. Format: CODE, VALUE");
      return;
    }

    try {
      await axiosInstance.post(`v1/visits/${visitId}/results/import`, { rows });
      toast.success(`Imported ${rows.length} values!`);
      setShowCsvModal(false);
      fetchData();
    } catch (err) {
      toast.error("CSV import failed");
    }
  };

  const categories = ["All", ...new Set(parameters.map((p) => p.category))];
  const filteredParams =
    categoryFilter === "All" ? parameters : parameters.filter((p) => p.category === categoryFilter);

  const entered = Object.values(resultsMap).filter((v) => v !== "" && !isNaN(Number(v))).length;
  const abnormal = parameters.filter((p) => {
    const s = computeStatus(p, resultsMap[p._id]);
    return s === "LOW" || s === "HIGH";
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-muted-foreground">
        Loading quantum parameters...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Patient Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white shadow-md">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-violet-200">
            Quantum Scan · Visit #{visitId?.slice(-6).toUpperCase()}
          </p>
          <h1 className="text-xl font-bold mt-1">
            {patient?.name}
            <span className="ml-2 text-sm font-normal text-violet-200">({patient?.patient_code})</span>
          </h1>
          <p className="text-xs text-violet-200 mt-0.5">
            Age: {patient?.age} | Gender: {patient?.gender} | Mobile: {patient?.mobile}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setShowCsvModal(true)} className="text-xs">
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> {t("bulkCSV")}
          </Button>
          <Button
            onClick={handleSaveAndAnalyze}
            disabled={saving}
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-sm px-5"
          >
            <Activity className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : t("runAutoAnalysis")}
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 text-center shadow-sm">
          <p className="text-2xl font-bold">{parameters.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Parameters</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-indigo-700">{entered}</p>
          <p className="text-xs text-indigo-500 mt-0.5">Values Entered</p>
        </div>
        <div className={`rounded-xl border p-4 text-center shadow-sm ${abnormal > 0 ? "bg-rose-50 border-rose-200 dark:bg-rose-950/40" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40"}`}>
          <p className={`text-2xl font-bold ${abnormal > 0 ? "text-rose-700" : "text-emerald-700"}`}>{abnormal}</p>
          <p className={`text-xs mt-0.5 ${abnormal > 0 ? "text-rose-500" : "text-emerald-500"}`}>Abnormal</p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white shadow"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Parameter Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[560px]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left w-20">Code</th>
                  <th className="px-4 py-3 text-left">Parameter ({lang.toUpperCase()})</th>
                  <th className="px-4 py-3 text-left">{t("normalRange")}</th>
                  <th className="px-4 py-3 w-40">{t("rawInput")}</th>
                  <th className="px-4 py-3 text-center w-32">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredParams.map((p) => {
                  const val = resultsMap[p._id] ?? "";
                  const status = computeStatus(p, val);
                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        status === "HIGH" ? "bg-rose-50/40 dark:bg-rose-950/10" :
                        status === "LOW" ? "bg-amber-50/40 dark:bg-amber-950/10" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-indigo-600">{p.code}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-800 dark:text-white">
                          {lang === "hi" ? p.name_hi : p.name_en}
                        </div>
                        <div className="text-xs text-slate-400">{p.category}</div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        {p.normal_min} – {p.normal_max} {p.unit}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          placeholder="—"
                          value={val}
                          onChange={(e) => setResultsMap((prev) => ({ ...prev, [p._id]: e.target.value }))}
                          className={`w-full rounded-lg border px-3 py-1.5 text-sm font-semibold text-center bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                            status === "HIGH" ? "border-rose-300 focus:ring-rose-400" :
                            status === "LOW" ? "border-amber-300 focus:ring-amber-400" :
                            status === "NORMAL" ? "border-emerald-300 focus:ring-emerald-400" :
                            "border-slate-200 focus:ring-indigo-400"
                          }`}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {status === "NORMAL" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">NORMAL</span>
                        )}
                        {status === "HIGH" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            <ChevronUp className="h-3 w-3" /> HIGH
                          </span>
                        )}
                        {status === "LOW" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            <ChevronDown className="h-3 w-3" /> LOW
                          </span>
                        )}
                        {!status && <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">Bulk CSV Import</h3>
            <p className="text-xs text-slate-500">
              Paste your machine's data. Each line: <code className="bg-slate-100 px-1 rounded">PARAMETER_CODE, VALUE</code>
            </p>
            <p className="text-xs text-slate-400">Example: <code>P001, 5.8</code></p>
            <textarea
              rows={8}
              placeholder={"P001, 5.8\nP002, 2.9\nP003, 0.6"}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCsvModal(false)}>Cancel</Button>
              <Button onClick={handleCSVImport} className="bg-emerald-600 hover:bg-emerald-700">
                Import Values
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
