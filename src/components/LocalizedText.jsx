import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    pickLocalized,
    pickLocalizedWithLang,
    getCachedTranslation,
    translateText,
} from "@/lib/translate";
import { DEFAULT_LANGUAGE } from "@/i18n/config";

/**
 * Renders a dynamic (DB/API sourced) value in the active language.
 *
 * - Localized objects (`{ en, hi, gu }`) / `_en`/`_hi`/`_gu` siblings are
 *   resolved instantly without any network call — BUT only when the active
 *   language genuinely differs from English. Backfilled rows (e.g.
 *   `hi === en`) fall through to machine translation instead of silently
 *   showing English to Hindi/Gujarati users.
 * - Plain English strings are machine-translated via the backend `/translate`
 *   endpoint (cached + batched). Until the translation resolves we already
 *   render the cached value if present, otherwise the original English string,
 *   so the UI never shows `undefined`/blank.
 *
 * @param {{ value: any, children?: any, fallback?: string, as?: any }} props
 */
export default function LocalizedText({ value, children, fallback = "", as: Tag }) {
    const { i18n } = useTranslation();
    const lang = i18n.language || DEFAULT_LANGUAGE;
    const activeLang = (lang || DEFAULT_LANGUAGE).split("-")[0];
    const initial = children !== undefined && children !== null ? children : value;

    const resolved = pickLocalized(initial, lang);
    const [text, setText] = useState(resolved);

    useEffect(() => {
        let cancelled = false;
        const next = pickLocalized(initial, lang);

        // A localized object only short-circuits when it truly supplied the
        // active language. If it fell back to English (missing/backfilled
        // translation), continue below and machine-translate the English text.
        let objectIsActive = false;
        if (initial && typeof initial === "object" && !Array.isArray(initial) && next) {
            const picked = pickLocalizedWithLang(initial, lang);
            objectIsActive = Boolean(picked) && picked.fromLang === activeLang;
            if (objectIsActive) {
                setText(next);
                return () => { cancelled = true; };
            }
        }

        if (activeLang === DEFAULT_LANGUAGE || !next || typeof next !== "string") {
            setText(next || fallback);
            return () => { cancelled = true; };
        }

        const cached = getCachedTranslation(next, lang);
        if (cached !== null) {
            setText(cached);
            return () => { cancelled = true; };
        }

        // Show source (English) text immediately, then swap in the translation.
        setText(next);
        translateText(next, lang)
            .then((translated) => {
                if (!cancelled && translated) setText(translated);
            })
            .catch(() => { });

        return () => { cancelled = true; };
    }, [initial, lang, fallback, activeLang]);

    const finalText = text === undefined || text === null || text === "" ? fallback : text;
    if (Tag) return <Tag>{finalText}</Tag>;
    return <>{finalText}</>;
}
