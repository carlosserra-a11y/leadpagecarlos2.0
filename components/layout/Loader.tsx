"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { CONFIG } from "@/lib/dados";
import { asset } from "@/lib/asset";
import { useMontado } from "@/components/ui/useMontado";

const MIN = 950; // tempo mínimo para o nome aparecer inteiro
const MAX = 1500; // prazo: nunca segura a página além disso
const CORTINA = 850;

export const introAcabou = () => typeof window !== "undefined" && !document.documentElement.classList.contains("carregando");

/* Tela de carregamento: o anel gótico gira, o nome surge do centro, o contador segue o
   carregamento real (fontes, página e cena 3D) e o espaço se abre a partir do buraco negro. */
export function Loader() {
  const { t } = useLang();
  const [n, setN] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const fim = useRef(false);
  const montado = useMontado();

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("carregando")) {
      window.dispatchEvent(new Event("lp2-intro-fim"));
      return;
    }
    const t0 = performance.now();
    const tarefas = { fontes: false, pagina: document.readyState === "complete", cena: false };
    let raf = 0;
    let timer = 0;

    const terminar = () => {
      if (fim.current) return;
      fim.current = true;
      cancelAnimationFrame(raf);
      setN(100);
      setSaindo(true);
      try {
        sessionStorage.setItem("lp2-intro", "1");
      } catch {
        /* sem armazenamento: a intro aparece de novo, sem problema */
      }
      timer = window.setTimeout(() => {
        html.classList.remove("carregando");
        window.dispatchEvent(new Event("lp2-intro-fim"));
      }, CORTINA);
    };

    document.fonts?.ready.then(() => (tarefas.fontes = true));
    const onLoad = () => (tarefas.pagina = true);
    const onCena = () => (tarefas.cena = true);
    addEventListener("load", onLoad, { once: true });
    addEventListener("lp2-cena", onCena, { once: true });

    const tick = () => {
      const dt = performance.now() - t0;
      const feitas = Object.values(tarefas).filter(Boolean).length / 3;
      // o contador anda com o tempo, mas só passa de 85% quando o que falta carregou
      const alvo = Math.min(dt / MIN, 0.15 + 0.7 * feitas + (feitas === 1 ? 0.15 : 0));
      setN((v) => Math.max(v, Math.round(alvo * 100)));
      if ((feitas === 1 && dt >= MIN) || dt >= MAX) return terminar();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // pular: tecla, clique, toque ou rolagem
    const pular = () => terminar();
    const opts = { once: true, passive: true } as const;
    addEventListener("keydown", pular, opts);
    addEventListener("pointerdown", pular, opts);
    addEventListener("wheel", pular, opts);
    addEventListener("touchstart", pular, opts);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      removeEventListener("load", onLoad);
      removeEventListener("lp2-cena", onCena);
      removeEventListener("keydown", pular);
      removeEventListener("pointerdown", pular);
      removeEventListener("wheel", pular);
      removeEventListener("touchstart", pular);
    };
  }, []);

  return (
    <div className="loader" data-saindo={saindo} aria-hidden="true">
      <div className="relative grid place-items-center">
        <svg className="loader-ring absolute size-[min(560px,96vw)]" viewBox="0 0 560 560">
          <circle cx="280" cy="280" r="205" fill="none" stroke="rgba(242,193,78,.18)" />
          <circle cx="280" cy="280" r="272" fill="none" stroke="rgba(242,193,78,.08)" />
          {montado && <use href={`${asset("/hero/anel.svg")}#anel`} />}
        </svg>
        <div className="loader-name relative grid justify-items-center gap-5 text-center">
          <p className="gothic gold-text text-[clamp(3rem,12vw,6.5rem)] leading-none">{CONFIG.nome}</p>
          <p className="mono text-[0.7rem] tracking-[0.3em] text-muted uppercase">
            {t.loader.carregando} <span className="tabular-nums text-gold-hi">{String(n).padStart(3, "0")}</span>
          </p>
        </div>
      </div>
      <p className="mono absolute bottom-[max(24px,env(safe-area-inset-bottom))] text-[0.65rem] tracking-[0.2em] text-muted/80 uppercase">{t.loader.pular}</p>
    </div>
  );
}
