// Central i18n architecture — Uttkarsh Member Portal
// -------------------------------------------------------------
// Adding a new language (e.g. Gujarati):
//   1. Create src/i18n/<code>.js exporting a flat object of key -> string
//   2. Add "<code>" to SUPPORTED_LANGUAGES below
//   3. Add the language name to LANGUAGE_NAMES
//   4. Provide the display label in en.js/hi.js/gu.js (selectLanguage menu)
// Missing keys automatically fall back to English, then to the key itself.
// -------------------------------------------------------------
import en from "./en";
import hi from "./hi";
import gu from "./gu";

export const SUPPORTED_LANGUAGES = ["en", "hi", "gu"];

export const LANGUAGE_NAMES = {
    en: "English",
    hi: "हिंदी",
    gu: "ગુજરાતી",
};

const translations = { en, hi, gu };

export const translate = (lang, key) =>
    translations[lang]?.[key] ?? translations.en?.[key] ?? key;

export default translations;
