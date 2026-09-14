/**
 * Central language configuration for the Member / Franchise Panel.
 *
 * Adding a new language is as simple as:
 *   1. Add an entry here (code + labels).
 *   2. Drop a matching `src/i18n/locales/<code>/translation.json`.
 */
export const SUPPORTED_LANGUAGES = [
    { code: "en", label: "English", nativeLabel: "English", short: "EN" },
    { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", short: "हि" },
    { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", short: "ગુ" },
];

export const DEFAULT_LANGUAGE = "en";

export const LANGUAGE_STORAGE_KEY = "uc_member_language";

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

export function isSupportedLanguage(code) {
    return LANGUAGE_CODES.includes(code);
}

/** Languages that need machine translation for dynamic (DB) content. */
export const TRANSLATABLE_LANGUAGES = LANGUAGE_CODES.filter((c) => c !== DEFAULT_LANGUAGE);

export function getStoredLanguage() {
    try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && isSupportedLanguage(stored)) return stored;
        const legacy = localStorage.getItem("language") || localStorage.getItem("lang");
        if (legacy && isSupportedLanguage(legacy)) return legacy;
    } catch {
        /* localStorage unavailable */
    }
    return DEFAULT_LANGUAGE;
}

export function setStoredLanguage(code) {
    try {
        if (isSupportedLanguage(code)) localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
        /* ignore */
    }
}

export function getLanguageMeta(code) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
}
