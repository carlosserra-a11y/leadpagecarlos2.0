"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { TEXTOS, type Lang, type Textos } from "@/lib/dados";

type Ctx = { lang: Lang; t: Textos; setLang: (l: Lang) => void; toggle: () => void };

const LangCtx = createContext<Ctx>({ lang: "pt", t: TEXTOS.pt, setLang: () => {}, toggle: () => {} });

const KEY = "lp2-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  // Idioma salvo ou ?lang=en: o HTML estático nasce em português
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = new URLSearchParams(location.search).get("lang") || localStorage.getItem(KEY);
    } catch {
      /* armazenamento bloqueado: fica em português */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- precisa esperar a hidratação (o HTML estático é em PT)
    if (saved === "en") setLangState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = TEXTOS[lang].meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", TEXTOS[lang].meta.desc);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* sem armazenamento: troca só nesta visita */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, t: TEXTOS[lang], setLang, toggle: () => setLang(lang === "pt" ? "en" : "pt") }),
    [lang, setLang],
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
