import axiosInstance from "@/lib/axios";
import { DEFAULT_LANGUAGE } from "@/i18n/config";
import {
    startTranslation,
    stopTranslation,
    markTranslationError,
} from "@/lib/translationLoading";

/**
 * Dynamic-content translation client (Member / Franchise Panel).
 *
 * Handles content that comes from the database / API:
 *   1. If the value is already a localized object (`{ en, hi, gu }`) or carries
 *      `_en` / `_hi` / `_gu` siblings, we pick the right language directly
 *      (no network) and only machine-translate when that language is missing.
 *   2. If the value is a plain (English) string, we ask the secure backend
 *      `/translate` endpoint (which talks to Google Translate) exactly once per
 *      unique string, then cache the result in memory + localStorage.
 *   3. Arrays / nested objects are walked recursively (`translateValue`).
 *
 * Requests are batched and de-duplicated. IDs, emails, phone numbers, URLs,
 * dates, prices and pure numbers are never sent for translation.
 */

const LS_PREFIX = "uc_member_tr_";
const memoryCache = new Map();

// Bump when translation behaviour changes. Older builds could cache the English
// source as the "translation" while the backend key was missing; purging stale
// entries once per browser lets dynamic content re-translate correctly.
const LS_VERSION = "v3";
const VERSION_KEY = "uc_member_translate_ver";

const DEBUG = (() => {
    try {
        return Boolean(import.meta?.env?.DEV);
    } catch {
        return false;
    }
})();

const log = (...args) => {
    if (DEBUG) console.log("[Translation]", ...args);
};

(function purgeStaleCache() {
    try {
        if (localStorage.getItem(VERSION_KEY) === LS_VERSION) return;
        const stale = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && (k.startsWith(LS_PREFIX) || /^uc_(member_|admin_)?tr_/.test(k))) stale.push(k);
        }
        stale.forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(VERSION_KEY, LS_VERSION);
        log("purged stale translation cache ->", LS_VERSION);
    } catch {
        /* storage unavailable */
    }
})();

function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}

// Key = prefix + target + hash(version | text). Version is folded into the hash
// so a version bump can never reuse a previously poisoned entry.
function cacheKey(text, target) {
    return `${LS_PREFIX}${target}_${hash(`${LS_VERSION}:${text}`)}`;
}

function getCached(text, target) {
    const key = cacheKey(text, target);
    if (memoryCache.has(key)) return memoryCache.get(key);
    try {
        const v = localStorage.getItem(key);
        if (v !== null) {
            memoryCache.set(key, v);
            return v;
        }
    } catch {
        /* ignore */
    }
    return null;
}

function setCached(text, target, value) {
    const key = cacheKey(text, target);
    memoryCache.set(key, value);
    try {
        localStorage.setItem(key, value);
    } catch {
        /* quota / privacy mode */
    }
}

/** Pick the requested language from a possibly-localized dynamic value. */
export function pickLocalized(value, lang) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
        const active = (lang || DEFAULT_LANGUAGE).split("-")[0];
        const base =
            active === DEFAULT_LANGUAGE ? "" : value[active] ?? value[`_${active}`];
        const english =
            value[DEFAULT_LANGUAGE] ?? value[`_${DEFAULT_LANGUAGE}`];

        // A localized value is only used when it is present AND genuinely
        // different from the English source. Legacy rows backfilled with the
        // English text would otherwise short-circuit machine translation and
        // silently show English to Hindi/Gujarati users.
        if (base !== undefined && base !== null && base !== "") {
            const baseText = String(base).trim();
            const englishText =
                english === undefined || english === null ? "" : String(english).trim();
            if (!englishText || baseText !== englishText) return base;
        }

        if (english !== undefined && english !== null && english !== "") return english;

        const order = ["hi", "gu", "_hi", "_gu"];
        for (const k of order) {
            const v = value[k];
            if (v !== undefined && v !== null && v !== "") return v;
        }
        return "";
    }
    return String(value);
}

/* ------------------------------------------------------------------ */
/* Localized-structure + "should we translate this?" helpers          */
/* ------------------------------------------------------------------ */

const LANG_KEYS = ["en", "hi", "gu", "_en", "_hi", "_gu"];

function isLocalizedLeaf(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const keys = Object.keys(value);
    return keys.length > 0 && keys.every((k) => LANG_KEYS.includes(k));
}

/** Resolve a localized leaf and report which language it actually came from. */
export function pickLocalizedWithLang(value, lang) {
    const order = [lang, `_${lang}`, DEFAULT_LANGUAGE, `_${DEFAULT_LANGUAGE}`, "hi", "_hi", "gu", "_gu"];
    for (const k of order) {
        const v = value[k];
        if (v !== undefined && v !== null && v !== "") return { text: v, fromLang: k.replace(/^_/, "") };
    }
    return null;
}

// Keys whose values must never be machine-translated (technical/opaque data).
const TECHNICAL_KEY = /(^|_)(id|ids|_id|at|date|datetime|timestamp|email|phone|mobile|contact|url|uri|link|image|image_url|img|photo|slug|code|token|password|hash|price|mrp|amount|qty|quantity|count|lat|lng|latitude|longitude|color|colour|icon|filename|file)$/i;

function isTechnicalKey(key) {
    return typeof key === "string" && TECHNICAL_KEY.test(key);
}

/**
 * Whether a string is worth sending to Google. Filters out IDs, emails, phone
 * numbers, URLs, dates, hex colours, pure numbers/symbols and empty values.
 */
export function isTranslatable(text) {
    if (typeof text !== "string") return false;
    const t = text.trim();
    if (!t) return false;
    if (t.length > 5000) return false;
    if (!/[A-Za-z\u0900-\u097F\u0A80-\u0AFF]/.test(t)) return false;
    if (/^(https?:\/\/|www\.|mailto:|tel:|\/)/i.test(t)) return false;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return false; // email
    if (/^\+?[\d\s()\-]{7,}$/.test(t)) return false; // phone
    if (/^[0-9a-f]{24}$/i.test(t)) return false; // Mongo ObjectId
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return false; // uuid
    if (/^#[0-9a-f]{3,8}$/i.test(t)) return false; // hex colour
    if (/^\d{4}-\d{2}-\d{2}([T\s].*)?$/.test(t)) return false; // ISO date
    return true;
}

/* ------------------------------------------------------------------ */
/* Batched translation queue                                          */
/* ------------------------------------------------------------------ */

const queue = new Map(); // target -> Map<text, resolve[]>
let flushTimer = null;

function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(flushQueue, 30);
}

async function flushQueue() {
    flushTimer = null;
    const snapshot = new Map(queue);
    queue.clear();

    for (const [target, map] of snapshot) {
        const texts = [...map.keys()];
        if (!texts.length) continue;

        // Centralized translation loader: starts the moment a batch begins and
        // is torn down in `finally`, so it always stops — on success OR failure.
        startTranslation();
        try {
            const { data } = await axiosInstance.post(
                "translate",
                {
                    texts,
                    target,
                    source: DEFAULT_LANGUAGE,
                },
                // Background call — must not trigger the *global* loader, but
                // it *is* tracked by the dedicated translation loader above.
                { silent: true }
            );
            const translations = (data && data.translations) || [];
            const results = (data && data.results) || [];
            log(`batch target=${target} count=${texts.length} provider=${data?.provider}`);
            texts.forEach((text, i) => {
                const translated = translations[i];
                const ok = results[i]
                    ? results[i].ok !== false
                    : Boolean(translated) && translated !== text;
                const value = translated || text;
                if (ok && translated) {
                    setCached(text, target, translated);
                } else {
                    console.warn(
                        `[Translation ERROR] "${String(text).slice(0, 50)}" was not translated to ${target} (falling back to source).`
                    );
                }
                (map.get(text) || []).forEach((resolve) => resolve(value));
            });
        } catch (err) {
            // Never block the UI on failure — fall back to the original text.
            console.error("[Translation ERROR] batch request failed:", err?.message || err);
            markTranslationError("Translation service is unavailable. Showing original text.");
            texts.forEach((text) => (map.get(text) || []).forEach((resolve) => resolve(text)));
        } finally {
            // Guaranteed teardown: the "Translating content…" indicator can
            // never get stuck, regardless of success or failure.
            stopTranslation();
        }
    }
}

/** Translate a single string (resolved via the shared batch queue). */
export function translateText(text, target) {
    if (!text || typeof text !== "string" || !target || target === DEFAULT_LANGUAGE) {
        return Promise.resolve(text);
    }
    if (!isTranslatable(text)) return Promise.resolve(text);
    const cached = getCached(text, target);
    if (cached !== null) return Promise.resolve(cached);

    return new Promise((resolve) => {
        if (!queue.has(target)) queue.set(target, new Map());
        const map = queue.get(target);
        if (!map.has(text)) map.set(text, []);
        map.get(text).push(resolve);
        scheduleFlush();
    });
}

/** Translate many strings at once, preserving order. */
export function translateTexts(texts, target) {
    return Promise.all((texts || []).map((t) => translateText(t, target)));
}

/**
 * Recursively translate any API/DB value into `target` without mutating the
 * original. Handles strings, arrays, nested objects and `{ en, hi, gu }` leaves
 * (returned directly when the requested language already exists).
 */
export async function translateValue(value, target) {
    if (!target || target === DEFAULT_LANGUAGE) return value;
    if (value === null || value === undefined) return value;
    if (typeof value === "string") return translateText(value, target);
    if (typeof value === "number" || typeof value === "boolean") return value;

    if (Array.isArray(value)) {
        return Promise.all(value.map((v) => translateValue(v, target)));
    }

    if (typeof value === "object") {
        if (isLocalizedLeaf(value)) {
            const picked = pickLocalizedWithLang(value, target);
            if (!picked) return "";
            if (picked.fromLang === target || !isTranslatable(picked.text)) return picked.text;
            return translateText(picked.text, target);
        }
        const out = {};
        await Promise.all(
            Object.entries(value).map(async ([key, child]) => {
                if (isTechnicalKey(key)) {
                    out[key] = child;
                } else {
                    out[key] = await translateValue(child, target);
                }
            })
        );
        return out;
    }
    return value;
}

export const translateDeep = translateValue;

/** Synchronously read a cached translation if we already have one. */
export function getCachedTranslation(text, target) {
    return getCached(text, target);
}

export function clearTranslationCache() {
    memoryCache.clear();
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(LS_PREFIX)) keys.push(k);
        }
        keys.forEach((k) => localStorage.removeItem(k));
    } catch {
        /* ignore */
    }
}
