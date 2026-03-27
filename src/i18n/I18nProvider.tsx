import { createContext, useContext, useState, useCallback } from "react";
import en from "./locales/en";
import tr from "./locales/tr";

type Locale = "en" | "tr";
type Translations = typeof en;

type I18nContextShape = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const locales: Record<Locale, Translations> = { en, tr };

const I18nContext = createContext<I18nContextShape>(null!);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>("en");

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let value: unknown = locales[locale];
      for (const k of keys) {
        if (value && typeof value === "object") {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      return typeof value === "string" ? value : key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
