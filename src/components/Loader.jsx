import React, { useSyncExternalStore } from "react";
import { subscribe, getSnapshot } from "@/lib/globalLoading";
import {
    subscribe as subscribeTranslation,
    getSnapshot as getTranslationSnapshot,
} from "@/lib/translationLoading";

const INDIGO = "#4f46e5";
const MUTED = "#64748b";

/**
 * Pure-SVG spinner (no CSS/animation dependency) so it renders identically in
 * every app and inside any theme.
 */
export function Spinner({ size = 24, strokeWidth = 4, className = "", style }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label="Loading"
            className={className}
            style={{ display: "inline-block", ...style }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                opacity="0.2"
            />
            <path
                d="M22 12a10 10 0 0 0-10-10"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="0.75s"
                    repeatCount="indefinite"
                />
            </path>
        </svg>
    );
}

/**
 * Inline loader. Use inside cards, modals, or sections that own their data.
 *
 *   {loading ? <Loader label="Loading patients…" /> : <Table />}
 */
export function Loader({ size = 32, label, className = "", style }) {
    return (
        <div
            className={className}
            role="status"
            aria-live="polite"
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                ...style,
            }}
        >
            <span style={{ color: INDIGO, display: "inline-flex" }}>
                <Spinner size={size} />
            </span>
            {label ? <span style={{ fontSize: 14, color: MUTED }}>{label}</span> : null}
        </div>
    );
}

export default Loader;

/**
 * Full-area centered loader for page- or panel-level loading states.
 */
export function PageLoader({ label = "Loading…", minHeight = "60vh", className = "", style }) {
    return (
        <div
            className={className}
            role="status"
            aria-live="polite"
            style={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                minHeight,
                ...style,
            }}
        >
            <span style={{ color: INDIGO, display: "inline-flex" }}>
                <Spinner size={36} />
            </span>
            {label ? <span style={{ fontSize: 14, color: MUTED }}>{label}</span> : null}
        </div>
    );
}

/**
 * Blocking overlay loader with a translucent backdrop. Use for destructive or
 * full-page mutations where the user must wait.
 */
export function OverlayLoader({ label = "Please wait…", visible = true }) {
    if (!visible) return null;
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99998,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                background: "rgba(15, 23, 42, 0.45)",
                backdropFilter: "blur(2px)",
            }}
        >
            <span style={{ color: "#ffffff", display: "inline-flex" }}>
                <Spinner size={40} />
            </span>
            {label ? (
                <span style={{ fontSize: 14, color: "#f8fafc", fontWeight: 500 }}>{label}</span>
            ) : null}
        </div>
    );
}

/**
 * Global top progress bar. Mounted once in `main.jsx`; automatically appears
 * whenever any tracked API request is in flight.
 */
export function GlobalLoader() {
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const visible = state.visible;

    return (
        <div
            aria-hidden={!visible}
            role="progressbar"
            aria-busy={visible}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                zIndex: 99999,
                pointerEvents: "none",
                opacity: visible ? 1 : 0,
                transition: "opacity 200ms ease",
            }}
        >
            <style>
                {"@keyframes uc-global-loading{0%{background-position:0% 50%}100%{background-position:200% 50%}}"}
            </style>
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    background:
                        "linear-gradient(90deg,#6366f1 0%,#8b5cf6 25%,#6366f1 50%,#8b5cf6 75%,#6366f1 100%)",
                    backgroundSize: "200% 100%",
                    animation: "uc-global-loading 1.2s linear infinite",
                }}
            />
        </div>
    );
}

/**
 * "Translating content…" indicator.
 *
 * Mounted once in `main.jsx`. Appears whenever any Google-Translate batch is in
 * flight (see `@/lib/translationLoading`), starts immediately and disappears
 * only after the request settles — success OR failure. Any failure is surfaced
 * as a small, non-blocking notice so existing content is never hidden.
 */
export function TranslationLoader() {
    const state = useSyncExternalStore(
        subscribeTranslation,
        getTranslationSnapshot,
        getTranslationSnapshot
    );
    const visible = state.visible;
    const failed = Boolean(state.error);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy={visible}
            style={{
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 99998,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: visible ? "10px 14px" : "0 14px",
                borderRadius: 9999,
                background: failed ? "#7f1d1d" : "#1e1b4b",
                color: "#f8fafc",
                boxShadow: "0 10px 30px -10px rgba(15,23,42,0.55)",
                fontSize: 13,
                fontWeight: 500,
                pointerEvents: "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(12px)",
                maxHeight: visible ? 60 : 0,
                overflow: "hidden",
                transition: "opacity 200ms ease, transform 200ms ease, max-height 200ms ease, padding 200ms ease",
            }}
        >
            {visible && !failed ? (
                <span style={{ display: "inline-flex", color: "#c7d2fe" }}>
                    <Spinner size={16} strokeWidth={4} />
                </span>
            ) : null}
            <span>{failed ? state.error : "Translating content…"}</span>
        </div>
    );
}
