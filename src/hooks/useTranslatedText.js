import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    pickLocalized,
    getCachedTranslation,
    translateText,
    isTranslatable,
} from "@/lib/translate";
import { DEFAULT_LANGUAGE } from "@/i18n/config";

/**
 * Hook version of `LocalizedText` for cases where the translated string is
 * needed programmatically (e.g. table columns, toasts, PDF payloads).
 *
 * Returns the best-known value for the active language and updates in place
 * once a machine translation resolves. Never returns `undefined`/`null`.
 *
 * `lang` is in the dependency array so a language switch re-resolves at once.
 */
export function useTranslatedText(value, fallback = "") {
    const { i18n } = useTranslation();
    const lang = i18n.language || DEFAULT_LANGUAGE;
    const [text, setText] = useState(() => pickLocalized(value, lang));

    useEffect(() => {
        let cancelled = false;
        const next = pickLocalized(value, lang);

        // Localized object already resolved for this language.
        if (value && typeof value === "object" && next) {
            setText(next);
            return () => {
                cancelled = true;
            };
        }
        if (lang === DEFAULT_LANGUAGE || !next || typeof next !== "string") {
            setText(next || fallback);
            return () => {
                cancelled = true;
            };
        }
        if (!isTranslatable(next)) {
            setText(next);
            return () => {
                cancelled = true;
            };
        }

        const cached = getCachedTranslation(next, lang);
        if (cached !== null) {
            setText(cached);
            return () => {
                cancelled = true;
            };
        }

        setText(next);
        translateText(next, lang)
            .then((translated) => {
                if (!cancelled && translated) setText(translated);
            })
            .catch(() => { });

        return () => {
            cancelled = true;
        };
    }, [value, lang, fallback]);

    return text === undefined || text === null || text === "" ? fallback : text;
}

export default useTranslatedText;
