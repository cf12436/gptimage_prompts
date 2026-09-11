"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

export type Language = "zh" | "en";
const key = "aisaasgo:language:v1";
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (zh: string, en: string) => string;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Match the static Chinese HTML during hydration, then restore the preference.
  const [language, updateLanguage] = useState<Language>("zh");
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(key);
    } catch {
      /* Storage is optional. */
    }
    const value = requested === "en" || requested === "zh" ? requested : stored;
    if (value === "en" || value === "zh") {
      updateLanguage(value);
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Keep session usable. */
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    if (window.location.pathname === "/") {
      document.title =
        language === "zh"
          ? "AISaasGo Image — 开源 AI 图像提示词灵感库"
          : "AISaasGo Image — Open-source AI image prompt library";
    } else if (window.location.pathname.replace(/\/$/, "") === "/privacy") {
      document.title =
        language === "zh"
          ? "隐私说明 · AISaasGo Image"
          : "Privacy notice · AISaasGo Image";
    }
  }, [language]);

  const setLanguage = useCallback((value: Language) => {
    updateLanguage(value);
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Switching works without storage. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", value);
    window.history.replaceState(null, "", url);
  }, []);
  const t = useCallback(
    (zh: string, en: string) => (language === "zh" ? zh : en),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage requires LanguageProvider");
  return value;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="语言 / Language"
    >
      <button
        type="button"
        lang="zh-CN"
        aria-pressed={language === "zh"}
        onClick={() => setLanguage("zh")}
      >
        中文
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        lang="en"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}

export function SkipLink() {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  return (
    <a
      className="skip-link"
      href={pathname === "/" ? "#library" : `/?lang=${language}#library`}
    >
      {t("跳转到提示词库", "Skip to prompt library")}
    </a>
  );
}
