import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SUPPORTED_LANGUAGES, translate } from "@/i18n";
import { updateUser } from "@/services/userService";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // 1) Prefer the persisted backend preference, then localStorage, then English.
    try {
      const userDetails = localStorage.getItem("UserDetails");
      if (userDetails) {
        const parsed = JSON.parse(userDetails);
        if (parsed?.language_pref && SUPPORTED_LANGUAGES.includes(parsed.language_pref)) {
          return parsed.language_pref;
        }
      }
    } catch (err) {
      // ignore corrupted storage
    }
    const stored = localStorage.getItem("app_lang");
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : "en";
  });

  // Keep localStorage in sync whenever the language changes.
  useEffect(() => {
    localStorage.setItem("app_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist the preference to the logged-in user's record (fire-and-forget).
  const persistLanguage = useCallback(async (nextLang) => {
    try {
      const raw = localStorage.getItem("UserDetails");
      if (!raw) return;
      const userDetails = JSON.parse(raw);
      const userId = userDetails?._id || userDetails?.id || userDetails?.userId;
      if (!userId) return;
      await updateUser(userId, { language_pref: nextLang });
      // Update the cached UserDetails so future logins restore the same language.
      const updated = { ...userDetails, language_pref: nextLang };
      localStorage.setItem("UserDetails", JSON.stringify(updated));
    } catch (err) {
      // Non-blocking: UI language still changes even if persistence fails.
      console.error("Failed to persist language preference:", err);
    }
  }, []);

  const changeLanguage = useCallback(
    (nextLang) => {
      if (!SUPPORTED_LANGUAGES.includes(nextLang)) return;
      setLang(nextLang);
      localStorage.setItem("app_lang", nextLang);
      persistLanguage(nextLang);
    },
    [persistLanguage]
  );

  const toggleLanguage = useCallback(() => {
    const currentIndex = SUPPORTED_LANGUAGES.indexOf(lang);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    changeLanguage(SUPPORTED_LANGUAGES[nextIndex]);
  }, [lang, changeLanguage]);

  const t = useCallback((key) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, changeLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
