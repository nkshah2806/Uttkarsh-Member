import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import gu from "./locales/gu/translation.json";

import {
    DEFAULT_LANGUAGE,
    getStoredLanguage,
    setStoredLanguage,
} from "./config";

export const resources = {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        resources,
        lng: getStoredLanguage(),
        fallbackLng: DEFAULT_LANGUAGE, // Fallback logic: selected language -> English
        supportedLngs: ["en", "hi", "gu"],
        interpolation: { escapeValue: false },
        returnNull: false,
        returnEmptyString: false,
        react: { useSuspense: false },
    });

    // Persist selection + reflect on <html lang> so fonts/hyphenation stay correct.
    i18n.on("languageChanged", (lng) => {
        setStoredLanguage(lng);
        try {
            document.documentElement.lang = lng;
        } catch {
            /* non-browser env */
        }
    });

    try {
        document.documentElement.lang = i18n.language;
    } catch {
        /* ignore */
    }
}

export default i18n;
