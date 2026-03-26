import { type ReactNode, createContext, useContext, useState } from "react";

export type Language = "en-US" | "hi-IN" | "pa-IN";

const LANG_LABELS: Record<Language, string> = {
  "en-US": "English",
  "hi-IN": "Hindi",
  "pa-IN": "Punjabi",
};

export const LANG_LABELS_MAP = LANG_LABELS;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en-US",
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = (localStorage.getItem("tts-language") as Language) || "en-US";
  const [language, setLanguageState] = useState<Language>(stored);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("tts-language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
