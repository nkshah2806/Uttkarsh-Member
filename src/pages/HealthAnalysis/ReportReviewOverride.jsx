import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileCheck,
  CheckSquare,
  Square,
  MinusSquare,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Eye,
  Activity,
  Layers,
  AlertCircle,
  Stethoscope,
  Maximize2,
  Minimize2,
  Pill,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportReviewOverride() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [analysisData, setAnalysisData] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [nextVisitDate, setNextVisitDate] = useState("");

  // Medicines library (active medicines from admin)
  const [medicines, setMedicines] = useState([]);
  // Per-parameter medicine association: { [paramId]: [{_id,name,details,dosage,is_active}] }
  const [paramMedicines, setParamMedicines] = useState({});
  // Per-parameter consultant note: { [paramId]: string }
  const [paramNotes, setParamNotes] = useState({});
  // Per-parameter medicine search text: { [paramId]: string }
  const [medicineSearch, setMedicineSearch] = useState({});
  // Per-parameter dropdown open state: { [paramId]: boolean }
  const [medicineDropdownOpen, setMedicineDropdownOpen] = useState({});

  // Selection Map: { [`${paramId}_${nodeId}`]: boolean }
  const [selections, setSelections] = useState({});
  // Expanded parameters map: { [paramId]: boolean }
  const [expandedParams, setExpandedParams] = useState({});
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  const getItemKey = (paramId, bulletId) => `${paramId}_${bulletId}`;

  // Per-parameter medicine helpers
  const getParamMedicines = (paramId) => paramMedicines[paramId] || [];
  const getParamNote = (paramId) => paramNotes[paramId] || "";
  const getParamSearch = (paramId) => medicineSearch[paramId] || "";
  const isParamDropdownOpen = (paramId) => Boolean(medicineDropdownOpen[paramId]);

  useEffect(() => {
    fetchData();
  }, [visitId]);

  // Load active medicines available for selection (admin library)
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const mRes = await axiosInstance.get("v1/admin/medicines");
        const list = mRes.data?.data || [];
        setMedicines(list);
        // Refresh selected snapshots with fresh master data where still available
        setParamMedicines((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((paramId) => {
            next[paramId] = (next[paramId] || []).map((sel) => {
              const fresh = list.find((m) => String(m._id) === String(sel._id));
              return fresh
                ? {
                  _id: String(fresh._id),
                  name: fresh.name,
                  details: fresh.details || "",
                  dosage: fresh.dosage || "",
                  is_active: fresh.is_active,
                }
                : sel;
            });
          });
          return next;
        });
      } catch (err) {
        console.warn("Failed to load medicines:", err.message);
      }
    };
    loadMedicines();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, aRes] = await Promise.all([
        axiosInstance.get(`v1/visits/${visitId}`),
        axiosInstance.get(`v1/visits/${visitId}/auto-report`),
      ]);

      const visitData = vRes.data.data?.visit;
      setPatient(visitData?.patient_id);

      const analysis = aRes.data.data;
      setAnalysisData(analysis);

      // Restore previously saved per-parameter medicine selections from the visit
      const savedParamMedicines = visitData?.parameter_medicines || [];
      if (Array.isArray(savedParamMedicines) && savedParamMedicines.length > 0) {
        const restored = {};
        const restoredNotes = {};
        savedParamMedicines.forEach((entry) => {
          if (!entry?.parameter_id) return;
          restored[String(entry.parameter_id)] = (entry.medicines || []).map((s) => ({
            _id: String(s.medicine_id),
            name: s.name_snapshot || "",
            details: s.details_snapshot || "",
            dosage: s.dosage_snapshot || "",
            is_active: false,
          }));
          if (entry.note) restoredNotes[String(entry.parameter_id)] = entry.note;
        });
        setParamMedicines(restored);
        setParamNotes(restoredNotes);
      } else {
        // Backward compatibility: legacy visit-level medicines + note
        const savedMedicines = visitData?.medicines || [];
        if (savedMedicines.length > 0 || visitData?.medicine_note) {
          const legacy = {};
          const legacyNotes = {};
          (analysis.analyzed_items || []).forEach((item) => {
            legacy[item.parameter.id] = savedMedicines.map((s) => ({
              _id: String(s.medicine_id),
              name: s.name_snapshot || "",
              details: s.details_snapshot || "",
              dosage: s.dosage_snapshot || "",
              is_active: false,
            }));
            if (visitData?.medicine_note) {
              legacyNotes[item.parameter.id] = visitData.medicine_note;
            }
          });
          setParamMedicines(legacy);
          setParamNotes(legacyNotes);
        }
      }

      // Initialize selections map & expanded state with parameter-scoped keys
      const initialMap = {};
      const initialExpanded = {};

      (analysis.analyzed_items || []).forEach((item) => {
        const pId = item.parameter.id;
        initialExpanded[pId] = true;

        (item.sections || []).forEach((sec) => {
          (sec.items || []).forEach((bullet) => {
            const key = getItemKey(pId, bullet.id);
            initialMap[key] = bullet.is_selected !== false;
          });
        });
      });

      setSelections(initialMap);
      setExpandedParams(initialExpanded);
    } catch (err) {
      toast.error("Failed to load visit analysis data");
    } finally {
      setLoading(false);
    }
  };

  // Toggle single item
  const toggleItem = (paramId, bulletId) => {
    const key = getItemKey(paramId, bulletId);
    setSelections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle entire section
  const toggleSection = (paramId, section, shouldSelect) => {
    setSelections((prev) => {
      const next = { ...prev };
      (section.items || []).forEach((it) => {
        const key = getItemKey(paramId, it.id);
        next[key] = shouldSelect;
      });
      return next;
    });
  };

  // Select all / Deselect all
  const handleSelectAll = (selectVal) => {
    if (!analysisData) return;
    setSelections((prev) => {
      const next = { ...prev };
      (analysisData.analyzed_items || []).forEach((item) => {
        const pId = item.parameter.id;
        (item.sections || []).forEach((sec) => {
          (sec.items || []).forEach((bullet) => {
            const key = getItemKey(pId, bullet.id);
            next[key] = selectVal;
          });
        });
      });
      return next;
    });
  };

  // Reset to initial recommendations
  const handleReset = () => {
    if (!analysisData) return;
    const initialMap = {};
    (analysisData.analyzed_items || []).forEach((item) => {
      const pId = item.parameter.id;
      (item.sections || []).forEach((sec) => {
        (sec.items || []).forEach((bullet) => {
          const key = getItemKey(pId, bullet.id);
          initialMap[key] = bullet.is_selected !== false;
        });
      });
    });
    setSelections(initialMap);
    toast.success("Selections reset to recommended defaults.");
  };

  // Toggle parameter accordion
  const toggleParamExpand = (paramId) => {
    setExpandedParams((prev) => ({
      ...prev,
      [paramId]: !prev[paramId],
    }));
  };

  const handleExpandAll = (expand) => {
    if (!analysisData) return;
    const next = {};
    analysisData.analyzed_items.forEach((item) => {
      next[item.parameter.id] = expand;
    });
    setExpandedParams(next);
  };

  const toggleMedicine = (paramId, med) => {
    setParamMedicines((prev) => {
      const current = prev[paramId] || [];
      const exists = current.some((m) => String(m._id) === String(med._id));
      if (exists) {
        return {
          ...prev,
          [paramId]: current.filter((m) => String(m._id) !== String(med._id)),
        };
      }
      return {
        ...prev,
        [paramId]: [
          ...current,
          {
            _id: String(med._id),
            name: med.name,
            details: med.details || "",
            dosage: med.dosage || "",
            is_active: med.is_active,
          },
        ],
      };
    });
  };

  const removeMedicine = (paramId, id) => {
    setParamMedicines((prev) => ({
      ...prev,
      [paramId]: (prev[paramId] || []).filter((m) => String(m._id) !== String(id)),
    }));
  };

  const clearMedicines = (paramId) => {
    setParamMedicines((prev) => ({ ...prev, [paramId]: [] }));
    setMedicineSearch((prev) => ({ ...prev, [paramId]: "" }));
  };

  const setParamNote = (paramId, value) => {
    setParamNotes((prev) => ({ ...prev, [paramId]: value }));
  };

  // Render the searchable medicine multi-select + note block for a single parameter
  const renderMedicineSection = (paramId) => {
    const selected = getParamMedicines(paramId);
    const note = getParamNote(paramId);
    const search = getParamSearch(paramId);
    const open = isParamDropdownOpen(paramId);
    const filtered = getFilteredMedicines(paramId);

    return (
      <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/40 dark:bg-violet-950/20 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="text-violet-600">
              <Pill className="h-3.5 w-3.5" />
            </span>
            Select Medicine(s)
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => clearMedicines(paramId)}
              className="text-[10px] text-slate-400 hover:text-red-500 underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Searchable multi-select */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setMedicineDropdownOpen((prev) => ({ ...prev, [paramId]: !prev[paramId] }))
            }
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <span className="truncate">
              {selected.length === 0
                ? "Search & select medicines..."
                : `${selected.length} medicine${selected.length > 1 ? "s" : ""} selected`}
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setMedicineSearch((prev) => ({ ...prev, [paramId]: e.target.value }))
                  }
                  placeholder="Type to search medicines..."
                  className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                />
              </div>
              <div className="max-h-40 overflow-y-auto p-1">
                {filtered.length === 0 ? (
                  <p className="px-3 py-3 text-[11px] text-slate-400">
                    {activeMedicines.length === 0
                      ? "No active medicines available. Please ask admin to add medicines."
                      : "No medicines found"}
                  </p>
                ) : (
                  filtered.map((med) => {
                    const isSelected = selected.some((m) => String(m._id) === String(med._id));
                    return (
                      <button
                        key={med._id}
                        type="button"
                        onClick={() => toggleMedicine(paramId, med)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                            {med.name}
                          </span>
                          {med.dosage && (
                            <span className="block text-[10px] text-slate-400 truncate">
                              {med.dosage}
                            </span>
                          )}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-violet-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Selected medicines chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((med) => (
              <span
                key={med._id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-[11px] font-medium text-violet-700 dark:text-violet-300"
              >
                {med.name}
                <button
                  type="button"
                  onClick={() => removeMedicine(paramId, med._id)}
                  className="text-violet-400 hover:text-violet-700 dark:hover:text-violet-200"
                  aria-label={`Remove ${med.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Note textarea */}
        <textarea
          value={note}
          onChange={(e) => setParamNote(paramId, e.target.value)}
          rows={2}
          placeholder="Optional note about the prescribed medicines..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>
    );
  };

  // Save selections and finalize
  const handleGenerateFinalReport = async () => {
    try {
      setSaving(true);
      setShowConfirmModal(false);

      // Build payload for backend with parameter isolation
      const payload = [];
      (analysisData?.analyzed_items || []).forEach((item) => {
        const paramId = item.parameter.id;
        (item.sections || []).forEach((sec) => {
          (sec.items || []).forEach((bullet) => {
            const key = getItemKey(paramId, bullet.id);
            payload.push({
              parameter_id: paramId,
              node_id: bullet.id,
              parameter_master_content_id: bullet.id?.length === 24 ? bullet.id : undefined,
              is_selected: Boolean(selections[key]),
            });
          });
        });
      });

      // Build per-parameter medicines + note payload
      const parameterMedicinesPayload = (analysisData?.analyzed_items || [])
        .map((item) => {
          const paramId = item.parameter.id;
          const meds = getParamMedicines(paramId);
          const note = (getParamNote(paramId) || "").trim();
          if (meds.length === 0 && !note) return null;
          return {
            parameter_id: paramId,
            medicines: meds.map((m) => m._id),
            note: note || undefined,
          };
        })
        .filter(Boolean);

      await axiosInstance.patch(`v1/visits/${visitId}/selected-content`, {
        selections: payload,
        ...(nextVisitDate ? { next_visit_date: nextVisitDate } : {}),
        parameter_medicines: parameterMedicinesPayload,
      });

      toast.success("Selections saved! Generating final report...");
      navigate(`/report-pdf/${visitId}`);
    } catch (err) {
      toast.error("Failed to save report selections");
    } finally {
      setSaving(false);
    }
  };

  const activeMedicines = useMemo(
    () => (medicines || []).filter((m) => m.is_active !== false),
    [medicines]
  );

  const getFilteredMedicines = (paramId) => {
    const q = getParamSearch(paramId).toLowerCase().trim();
    if (!q) return activeMedicines;
    return activeMedicines.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.details || "").toLowerCase().includes(q) ||
        (m.dosage || "").toLowerCase().includes(q)
    );
  };

  // Metrics computation
  const { totalItemsCount, selectedItemsCount } = useMemo(() => {
    let total = 0;
    let selected = 0;
    (analysisData?.analyzed_items || []).forEach((item) => {
      const pId = item.parameter.id;
      (item.sections || []).forEach((sec) => {
        (sec.items || []).forEach((bullet) => {
          total++;
          const key = getItemKey(pId, bullet.id);
          if (selections[key] === true) {
            selected++;
          }
        });
      });
    });
    return { totalItemsCount: total, selectedItemsCount: selected };
  }, [analysisData, selections]);

  const selectionPercentage = totalItemsCount > 0 ? Math.round((selectedItemsCount / totalItemsCount) * 100) : 0;

  // Filtered analysis items based on search query
  const filteredAnalysisItems = useMemo(() => {
    if (!analysisData?.analyzed_items) return [];
    if (!searchQuery.trim()) return analysisData.analyzed_items;

    const q = searchQuery.toLowerCase();
    return analysisData.analyzed_items
      .map((item) => {
        const paramMatch =
          item.parameter.code.toLowerCase().includes(q) ||
          item.parameter.name_en.toLowerCase().includes(q) ||
          item.parameter.name_hi.toLowerCase().includes(q) ||
          item.parameter.category.toLowerCase().includes(q);

        const matchingSections = (item.sections || [])
          .map((sec) => {
            const secTitleMatch = sec.title_en.toLowerCase().includes(q) || sec.title_hi.toLowerCase().includes(q);
            const matchingItems = (sec.items || []).filter(
              (it) => it.text_en.toLowerCase().includes(q) || it.text_hi.toLowerCase().includes(q)
            );

            if (secTitleMatch || matchingItems.length > 0) {
              return {
                ...sec,
                items: secTitleMatch ? sec.items : matchingItems,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (paramMatch || matchingSections.length > 0) {
          return {
            ...item,
            sections: paramMatch ? item.sections : matchingSections,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [analysisData, searchQuery]);

  // Live report preview items (strictly selected items only)
  const previewSelectedParameters = useMemo(() => {
    if (!analysisData?.analyzed_items) return [];
    return analysisData.analyzed_items
      .map((item) => {
        const pId = item.parameter.id;
        const validSections = (item.sections || [])
          .map((sec) => {
            const selectedBullets = (sec.items || []).filter(
              (it) => selections[getItemKey(pId, it.id)] === true
            );
            return {
              ...sec,
              items: selectedBullets,
            };
          })
          .filter((sec) => sec.items.length > 0);

        return {
          ...item,
          sections: validSections,
        };
      })
      .filter((item) => item.sections.length > 0);
  }, [analysisData, selections]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4 text-center">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Running Quantum Auto-Analysis Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Patient & Session Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-indigo-200">
              Report Content Review Studio
            </span>
            <span className="bg-indigo-900/80 px-2 py-0.5 rounded text-[11px] font-mono">
              Visit #{visitId?.slice(-6).toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl font-bold">
            {patient?.name} <span className="text-sm font-normal text-indigo-200">({patient?.patient_code})</span>
          </h1>
          <p className="text-xs text-indigo-200">
            Age: {patient?.age} Yrs | Gender: {patient?.gender} | Mobile: {patient?.mobile}
            {patient?.weight ? ` | ${patient.weight} ${patient.weight_unit || "kg"}` : ""}
            {patient?.height ? ` | ${patient.height} ${patient.height_unit || "cm"}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-indigo-200 font-semibold">Selected for Report</div>
            <div className="text-xl font-extrabold text-white">
              {selectedItemsCount} <span className="text-xs font-normal text-indigo-200">/ {totalItemsCount} Points</span>
            </div>
          </div>
          <Button
            onClick={() => setShowConfirmModal(true)}
            disabled={saving || selectedItemsCount === 0}
            className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-lg shrink-0 flex items-center gap-2"
          >
            <FileCheck className="h-4 w-4 text-indigo-600" />
            <span>Generate Final Report</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2-PART SPLIT DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PARAMETER CONTENT SELECTION STUDIO (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Sticky Toolbar for Search & Batch Selection */}
          <Card className="border-0 shadow-sm sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <CardContent className="p-4 space-y-3">
              {/* Search & Selection Progress Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search parameter, symptoms, recommendations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll(true)}
                    className="h-8 px-2.5 text-xs font-semibold"
                  >
                    Select All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSelectAll(false)}
                    className="h-8 px-2.5 text-xs font-semibold"
                  >
                    Deselect All
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Reset to Defaults"
                    onClick={handleReset}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Live Selection Stats Strip */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedItemsCount} of {totalItemsCount} items selected
                  </span>
                  <span className="text-slate-400">({selectionPercentage}%)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExpandAll(true)}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Expand All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => handleExpandAll(false)}
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${selectionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* List of Abnormal Flagged Parameters */}
          {filteredAnalysisItems.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                  No abnormal items found matching criteria.
                </p>
                <p className="text-xs">All parameters are within normal ranges or filtered out.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAnalysisItems.map((item) => {
                const param = item.parameter;
                const isExpanded = expandedParams[param.id] !== false;

                // Parameter level counts
                const allParamNodes = (item.sections || []).flatMap((s) => s.items || []);
                const selectedParamNodes = allParamNodes.filter(
                  (it) => selections[getItemKey(param.id, it.id)] === true
                );

                return (
                  <Card key={param.id} className="border-0 shadow-sm overflow-hidden rounded-2xl">
                    {/* Parameter Card Accordion Header */}
                    <div
                      onClick={() => toggleParamExpand(param.id)}
                      className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          {param.code}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {param.name_en}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            Normal: {param.normal_min}–{param.normal_max} {param.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${item.result_type === "HIGH"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                        >
                          {item.result_type === "HIGH" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {item.result_type} ({item.raw_value} {param.unit})
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          {selectedParamNodes.length} / {allParamNodes.length}
                        </span>

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Parameter Hierarchical Sections & Bullets */}
                    {isExpanded && (
                      <CardContent className="p-5 space-y-5">
                        {(item.sections || []).map((sec) => {
                          const secItems = sec.items || [];
                          const selectedSecItems = secItems.filter(
                            (it) => selections[getItemKey(param.id, it.id)] === true
                          );
                          const allSelected = secItems.length > 0 && selectedSecItems.length === secItems.length;
                          const someSelected = selectedSecItems.length > 0 && selectedSecItems.length < secItems.length;

                          return (
                            <div key={`${param.id}_${sec.id}`} className="space-y-2.5">
                              {/* Section Heading with Tri-State Checkbox */}
                              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                                <div
                                  onClick={() => toggleSection(param.id, sec, !allSelected)}
                                  className="flex items-center gap-2 cursor-pointer select-none group"
                                >
                                  {allSelected ? (
                                    <CheckSquare className="h-4 w-4 text-indigo-600 shrink-0" />
                                  ) : someSelected ? (
                                    <MinusSquare className="h-4 w-4 text-indigo-600 shrink-0" />
                                  ) : (
                                    <Square className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                                  )}
                                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    {sec.title_en}
                                  </span>
                                </div>

                                <span className="text-[10px] font-mono text-slate-400">
                                  {selectedSecItems.length} of {secItems.length} selected
                                </span>
                              </div>

                              {/* Section Bullet Items List */}
                              <div className="space-y-2 pl-2">
                                {secItems.map((bullet) => {
                                  const itemKey = getItemKey(param.id, bullet.id);
                                  const isChecked = selections[itemKey] === true;
                                  const isSub = bullet.level > 1;

                                  return (
                                    <div
                                      key={itemKey}
                                      onClick={() => toggleItem(param.id, bullet.id)}
                                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${isSub ? "ml-5 bg-slate-50/50" : ""
                                        } ${isChecked
                                          ? "bg-indigo-50/60 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 shadow-xs"
                                          : "bg-slate-50/30 border-slate-200/60 opacity-60 dark:bg-slate-900"
                                        }`}
                                    >
                                      <div className="mt-0.5 shrink-0">
                                        {isChecked ? (
                                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                                        ) : (
                                          <Square className="h-4 w-4 text-slate-400" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white leading-relaxed">
                                          {bullet.text_en}
                                        </p>
                                      </div>

                                      <span className="shrink-0 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                        {bullet.categoryType || "ITEM"}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Per-Parameter Medicine Selection + Note */}
                        {renderMedicineSection(param.id)}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY LIVE REPORT PREVIEW PANEL (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 sticky top-5 space-y-3">
          <Card className="border shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
            {/* Live Preview Header */}
            <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Live Selected Report Preview
                </span>
              </div>

            </div>

            {/* Document Body Preview */}
            <div className="p-4 overflow-y-auto max-h-[620px] space-y-4 text-xs font-sans bg-white dark:bg-slate-900">
              {/* Document Header Box */}
              <div className="border-b pb-3 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200">
                      QUANTUM HEALTH ANALYSIS REPORT
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {patient?.name} ({patient?.patient_code}) • {new Date().toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedItemsCount} Points Selected
                  </span>
                </div>
              </div>

              {/* Scanned Findings Summary */}
              {previewSelectedParameters.length === 0 ? (
                <div className="py-20 text-center text-slate-400 space-y-2">
                  <AlertCircle className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs">No points selected yet. Select items on the left to build the report.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {previewSelectedParameters.map((item) => {
                    const p = item.parameter;
                    return (
                      <div key={p.id} className="border rounded-xl p-3 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                          <div>
                            <span className="font-mono font-bold text-indigo-600 text-[11px] mr-1.5">{p.code}</span>
                            <strong className="text-xs text-slate-800 dark:text-slate-100">
                              {p.name_en}
                            </strong>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.result_type === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                              }`}
                          >
                            {item.result_type} · {item.raw_value} {p.unit}
                          </span>
                        </div>

                        {/* Parameter Sections */}
                        <div className="space-y-2 pt-1">
                          {item.sections.map((sec) => (
                            <div key={`${p.id}_${sec.id}`} className="space-y-1">
                              <h5 className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                ▸ {sec.title_en}
                              </h5>
                              <ul className="space-y-1 pl-3 list-disc">
                                {sec.items.map((bullet) => (
                                  <li
                                    key={`${p.id}_${bullet.id}`}
                                    className={`text-[11px] text-slate-700 dark:text-slate-300 leading-snug ${bullet.level > 1 ? "ml-3 list-circle text-slate-500" : ""
                                      }`}
                                  >
                                    {bullet.text_en}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Per-Parameter Medicines + Note in Live Preview */}
                        {getParamMedicines(p.id).length > 0 && (
                          <div className="pt-2 border-t border-violet-100 dark:border-violet-900 space-y-1.5">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1">
                              <Pill className="h-3 w-3" /> Recommended Medicines
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {getParamMedicines(p.id).map((med) => (
                                <span
                                  key={med._id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-[10px] font-medium text-violet-700 dark:text-violet-300"
                                >
                                  {med.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {getParamNote(p.id).trim() && (
                          <p className="pt-1 text-[10px] italic text-slate-500 dark:text-slate-400">
                            Note: {getParamNote(p.id)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Finalize Button */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ready to freeze snapshot?
              </span>
              <Button
                onClick={() => setShowConfirmModal(true)}
                disabled={saving || selectedItemsCount === 0}
                className="bg-indigo-600 hover:bg-indigo-700 font-bold text-xs"
              >
                <FileCheck className="mr-1.5 h-4 w-4" /> Generate Final Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL BEFORE GENERATING FINAL REPORT SNAPSHOT */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 border border-indigo-100">
            <div className="flex items-center gap-3 text-indigo-600">
              <Sparkles className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Final Report Generation</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You have selected <strong className="text-indigo-600">{selectedItemsCount} content points</strong> across{" "}
              <strong>{previewSelectedParameters.length} parameters</strong>.
            </p>

            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 text-xs space-y-1.5 text-slate-700 dark:text-slate-200">
              <p className="font-semibold text-indigo-900 dark:text-indigo-300">Report Freeze Guarantee:</p>
              <p className="text-[11px] text-slate-500">
                A permanent version snapshot will be saved. Future master data edits will never alter this patient's report.
              </p>
            </div>

            {/* Suggested Wellness Reassessment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Suggested Wellness Reassessment Date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {nextVisitDate && (
                <p className="text-[10px] text-indigo-500">
                  Wellness reassessment scheduled for:{" "}
                  {new Date(nextVisitDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Back to Review
              </Button>
              <Button
                onClick={handleGenerateFinalReport}
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {saving ? "Generating..." : "Confirm & View Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
