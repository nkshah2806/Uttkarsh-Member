import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronDown, ChevronUp, FileSpreadsheet, IndianRupee, ListFilter, Search, X } from "lucide-react";
import { toast } from "sonner";
import LocalizedText from "@/components/LocalizedText";
import { Loader } from "@/components/Loader";

export default function QuantumDataEntry() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [patient, setPatient] = useState(null);
  const [visit, setVisit] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRawText, setCsvRawText] = useState("");
  // Multi-select category filter — empty array = "All Categories"
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryFilterRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [visitId]);

  // Close the category filter dropdown on outside click or Escape key
  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handlePointerDown = (e) => {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setCategoryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryDropdownOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, pRes] = await Promise.all([
        axiosInstance.get(`v1/visits/${visitId}`),
        axiosInstance.get("v1/admin/parameters"),
      ]);

      setPatient(vRes.data.data.visit.patient_id);
      setVisit(vRes.data.data.visit);
      const params = pRes.data.data || [];
      setParameters(params);

      // Pre-fill existing results
      const map = {};
      (vRes.data.data.results || []).forEach((r) => {
        map[r.parameter_id._id || r.parameter_id] = r.raw_value;
      });
      setResultsMap(map);
    } catch (err) {
      toast.error(t("demo.quantumDataEntry.toastLoadFailed"));
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
        toast.error(t("demo.quantumDataEntry.toastNoValues"));
        return;
      }

      await axiosInstance.post(`v1/visits/${visitId}/results`, { results });
      toast.success(t("demo.quantumDataEntry.toastSaved"));
      navigate(`/report-review/${visitId}`);
    } catch (err) {
      toast.error(t("demo.quantumDataEntry.toastSaveFailed"));
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
      toast.error(t("demo.quantumDataEntry.toastNoValidRows"));
      return;
    }

    try {
      await axiosInstance.post(`v1/visits/${visitId}/results/import`, { rows });
      toast.success(t("demo.quantumDataEntry.toastImported", { count: rows.length }));
      setShowCsvModal(false);
      fetchData();
    } catch (err) {
      toast.error(t("demo.quantumDataEntry.toastCsvFailed"));
    }
  };

  // Unique categories present in the parameter list (drives the filter options)
  const filterCategories = [...new Set(parameters.map((p) => p.category).filter(Boolean))];

  const filteredParams = parameters.filter((p) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    return (
      matchesCategory &&
      ((p.code || "").toLowerCase().includes(q) ||
        (p.name_en || "").toLowerCase().includes(q) ||
        (p.name_hi || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q))
    );
  });

  const entered = Object.values(resultsMap).filter((v) => v !== "" && !isNaN(Number(v))).length;
  const abnormal = parameters.filter((p) => {
    const s = computeStatus(p, resultsMap[p._id]);
    return s === "LOW" || s === "HIGH";
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader size={36} label={t("demo.quantumDataEntry.loading")} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Patient Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 p-5 text-white shadow-md">
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-teal-200">
            {t("demo.quantumDataEntry.scanVisit", { code: visitId?.slice(-6).toUpperCase() })}
          </p>
          <h1 className="text-xl font-bold mt-1">
            {patient?.name}
            <span className="ml-2 text-sm font-normal text-teal-200">({patient?.patient_code})</span>
          </h1>
          <p className="text-xs text-teal-200 mt-0.5 inline-flex flex-wrap items-center gap-x-1.5">
            <span>{t("demo.quantumDataEntry.ageLabel")}</span>
            <span>{patient?.age ?? "—"}</span>
            <span aria-hidden="true">|</span>
            <span>{t("demo.quantumDataEntry.genderLabel")}</span>
            <span>{patient?.gender ?? "—"}</span>
            <span aria-hidden="true">|</span>
            <span>{t("demo.quantumDataEntry.mobileLabel")}</span>
            <span>{patient?.mobile ?? "—"}</span>
          </p>
          {visit?.scan_pricing?.amount != null && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 border border-white/30 backdrop-blur-sm">
              <IndianRupee className="h-3.5 w-3.5 shrink-0" />
              <span className="text-sm font-bold">
                {Number(visit.scan_pricing.amount).toLocaleString("en-IN")}
              </span>
              {visit.scan_pricing.name && (
                <span className="text-[10px] font-medium text-teal-100 uppercase tracking-wide">
                  · <LocalizedText value={visit.scan_pricing.name} />
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setShowCsvModal(true)} className="text-xs">
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> {t("demo.quantumDataEntry.csvUpload")}
          </Button>
          <Button
            onClick={handleSaveAndAnalyze}
            disabled={saving}
            className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-sm px-5"
          >
            <Activity className="mr-2 h-4 w-4" />
            {saving ? t("demo.quantumDataEntry.saving") : t("demo.quantumDataEntry.saveAndRun")}
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 text-center shadow-sm">
          <p className="text-2xl font-bold">{parameters.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t("demo.quantumDataEntry.totalParameters")}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-700">{entered}</p>
          <p className="text-xs text-emerald-500 mt-0.5">{t("demo.quantumDataEntry.valuesEntered")}</p>
        </div>
        <div className={`rounded-xl border p-4 text-center shadow-sm ${abnormal > 0 ? "bg-rose-50 border-rose-200 dark:bg-rose-950/40" : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40"}`}>
          <p className={`text-2xl font-bold ${abnormal > 0 ? "text-rose-700" : "text-emerald-700"}`}>{abnormal}</p>
          <p className={`text-xs mt-0.5 ${abnormal > 0 ? "text-rose-500" : "text-emerald-500"}`}>{t("demo.quantumDataEntry.abnormal")}</p>
        </div>
      </div>

      {/* Category Multi-Select Filter Dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative" ref={categoryFilterRef}>
          <button
            type="button"
            onClick={() => setCategoryDropdownOpen((open) => !open)}
            className={`inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg font-semibold transition-all border cursor-pointer ${selectedCategories.length > 0
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 border hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
              }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            <span className="inline-flex items-center">
              {selectedCategories.length === 0 ? (
                <span>{t("demo.quantumDataEntry.allCategories")}</span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <span>{t("demo.quantumDataEntry.filtering")}</span>
                  <span>{selectedCategories.length}</span>
                  <span>{t("demo.quantumDataEntry.categoriesLabel")}</span>
                </span>
              )}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${categoryDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {categoryDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 z-30 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("demo.quantumDataEntry.filterByCategory")}
                </span>
                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                  >
                    {t("demo.quantumDataEntry.clearCount", { count: selectedCategories.length })}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-1.5 space-y-0.5">
                <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="checkbox"
                    checked={selectedCategories.length === 0}
                    onChange={() => setSelectedCategories([])}
                    className="h-3.5 w-3.5 rounded accent-emerald-600"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1">
                    {t("demo.quantumDataEntry.allCategories")}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{parameters.length}</span>
                </label>

                {filterCategories.map((cat) => {
                  const count = parameters.filter((p) => p.category === cat).length;
                  const checked = selectedCategories.includes(cat);
                  const disabled = count === 0 && !checked;
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${disabled ? "opacity-45 cursor-not-allowed" : ""
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() =>
                          setSelectedCategories((prev) =>
                            checked ? prev.filter((c) => c !== cat) : [...prev, cat]
                          )
                        }
                        className="h-3.5 w-3.5 rounded accent-emerald-600"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">
                        {cat}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{count}</span>
                    </label>
                  );
                })}

                {filterCategories.length === 0 && (
                  <p className="px-2 py-3 text-xs text-slate-400 text-center">{t("demo.quantumDataEntry.noCategories")}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {selectedCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-full pl-2.5 pr-1.5 py-1"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                  className="p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 cursor-pointer"
                  aria-label={t("demo.quantumDataEntry.removeFilter", { cat })}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              {t("demo.quantumDataEntry.clearAll")}
            </button>
          </div>
        )}

        <p className="ml-auto text-xs text-slate-400 dark:text-slate-500">
          <span>{t("demo.quantumDataEntry.showing")}</span>{" "}
          <span className="font-semibold text-slate-600 dark:text-slate-400">{filteredParams.length}</span>
          <span>{t("demo.quantumDataEntry.of")}</span>{" "}
          <span className="font-semibold text-slate-600 dark:text-slate-400">{parameters.length}</span>
          <span>{t("demo.quantumDataEntry.parameters")}</span>
        </p>
      </div>

      {/* Parameter Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder={t("demo.quantumDataEntry.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Parameter Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[560px]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">{t("demo.quantumDataEntry.colParameter")}</th>
                  <th className="px-4 py-3 text-left">{t("demo.quantumDataEntry.colNormalRange")}</th>
                  <th className="px-4 py-3 w-40">{t("demo.quantumDataEntry.colValue")}</th>
                  <th className="px-4 py-3 text-center w-32">{t("demo.quantumDataEntry.colStatus")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredParams.map((p) => {
                  const val = resultsMap[p._id] ?? "";
                  const status = computeStatus(p, val);
                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${status === "HIGH" ? "bg-rose-50/40 dark:bg-rose-950/10" :
                        status === "LOW" ? "bg-amber-50/40 dark:bg-amber-950/10" : ""
                        }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-800 dark:text-white">
                          <LocalizedText value={p.name_en} />
                        </div>
                        <div className="text-xs text-slate-400"><LocalizedText value={p.category} /></div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        <span>{p.normal_min}</span>
                        <span aria-hidden="true"> – </span>
                        <span>{p.normal_max}</span>
                        <span> {p.unit}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          placeholder="—"
                          value={val}
                          onChange={(e) => setResultsMap((prev) => ({ ...prev, [p._id]: e.target.value }))}
                          className={`w-full rounded-lg border px-3 py-1.5 text-sm font-semibold text-center bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-colors ${status === "HIGH" ? "border-rose-300 focus:ring-rose-400" :
                            status === "LOW" ? "border-amber-300 focus:ring-amber-400" :
                              status === "NORMAL" ? "border-emerald-300 focus:ring-emerald-400" :
                                "border-slate-200 focus:ring-emerald-400"
                            }`}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {status === "NORMAL" && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{t("demo.quantumDataEntry.statusNormal")}</span>
                        )}
                        {status === "HIGH" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            <ChevronUp className="h-3 w-3" /> {t("demo.quantumDataEntry.statusHigh")}
                          </span>
                        )}
                        {status === "LOW" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            <ChevronDown className="h-3 w-3" /> {t("demo.quantumDataEntry.statusLow")}
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
            <h3 className="text-lg font-bold">{t("demo.quantumDataEntry.csvModalTitle")}</h3>
            <p className="text-xs text-slate-500">
              {t("demo.quantumDataEntry.csvModalDesc")} <code className="bg-slate-100 px-1 rounded">PARAMETER_CODE, VALUE</code>
            </p>
            <p className="text-xs text-slate-400">{t("demo.quantumDataEntry.csvModalExample")} <code>P001, 5.8</code></p>
            <textarea
              rows={8}
              placeholder={"P001, 5.8\nP002, 2.9\nP003, 0.6"}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 font-mono text-xs dark:bg-slate-800 dark:border-slate-700"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCsvModal(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCSVImport} className="bg-emerald-600 hover:bg-emerald-700">
                {t("demo.quantumDataEntry.csvImportBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
