import React, { createContext, useContext, useCallback } from "react";
import { translate } from "@/i18n";

const LanguageContext = createContext();

// Language switching has been removed from the product. The application is
// now English-only. `lang` is fixed to "en" and `t(key)` always resolves the
// English translation (falling back to the raw key). Translation dictionaries
// are retained for future use; nothing here mutates them.
export function LanguageProvider({ children }) {
  const lang = "en";

  const changeLanguage = useCallback(() => {
    // No-op: language switching has been removed.
  }, []);

  const toggleLanguage = useCallback(() => {
    // No-op: language switching has been removed.
  }, []);

  const setLang = useCallback(() => {
    // No-op: language switching has been removed.
  }, []);

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
