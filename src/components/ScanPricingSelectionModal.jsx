import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tag, X, CheckCircle2 } from "lucide-react";

/**
 * Modal that lets a consultant pick the scan price plan for a NEW scan
 * before a visit is created. The chosen amount gets snapshotted on the
 * visit by the backend (visit.scan_pricing).
 *
 * Props:
 * - open: boolean
 * - pricings: array of active pricings [{ _id, name, description, amount, is_default }]
 * - onClose: () => void
 * - onConfirm: (pricingId: string) => void
 * - submitting: boolean
 */
export default function ScanPricingSelectionModal({
    open,
    pricings = [],
    onClose,
    onConfirm,
    submitting = false,
}) {
    const [selectedId, setSelectedId] = useState("");

    useEffect(() => {
        if (!open) return;
        const preferred = pricings.find((p) => p.is_default) || pricings[0];
        setSelectedId(preferred?._id || "");
    }, [open, pricings]);

    if (!open) return null;

    const selected = pricings.find((p) => p._id === selectedId) || null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                            <Tag className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                                Select Scan Price
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Choose the price plan for this scan session
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Pricing Options */}
                <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
                    {pricings.map((p) => {
                        const isSelected = p._id === selectedId;
                        return (
                            <button
                                key={p._id}
                                type="button"
                                disabled={submitting}
                                onClick={() => setSelectedId(p._id)}
                                className={`w-full text-left rounded-xl border p-3.5 transition-colors ${isSelected
                                        ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`font-bold text-sm ${isSelected
                                                        ? "text-emerald-800 dark:text-emerald-300"
                                                        : "text-slate-900 dark:text-slate-100"
                                                    }`}
                                            >
                                                {p.name || "Scan Price"}
                                            </span>
                                            {p.is_default && (
                                                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        {p.description && (
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`shrink-0 font-bold text-base ${isSelected
                                                ? "text-emerald-700 dark:text-emerald-300"
                                                : "text-slate-800 dark:text-slate-200"
                                            }`}
                                    >
                                        ₹{Number(p.amount ?? 0).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        The selected amount will be recorded on this scan & its reports.
                    </p>
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {selected ? (
                            <>
                                Charging{" "}
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                                    ₹{Number(selected.amount ?? 0).toLocaleString("en-IN")}
                                </span>
                            </>
                        ) : (
                            "No price selected"
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={!selected || submitting}
                            onClick={() => selected && onConfirm(selected._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                            {submitting ? "Starting Scan..." : "Start Scan"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
