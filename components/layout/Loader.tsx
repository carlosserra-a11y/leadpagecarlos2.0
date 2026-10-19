"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { NOME } from "./nomePath";

const MIN = 1450; // tempo para o nome ser escrito e preenchido inteiro
const MAX = 2000; // prazo: nunca segura a página além disso
const CORTINA = 850;

// caixa do nome (para o degradê e o brilho cobrirem a palavra toda, não cada letra)
const [VX, VY, VW, VH] = NOME.viewBox.split(" ").map(Number);

export const introAcabou = () =>
  typeof window !== "undefined" &&
  !document.documentElement.classList.contains("carregando");

/* Tela de carregamento: uma luz prateada orbita o horizonte, o nome é escrito letra por letra com um
   traço de prata, ganha o preenchimento cromado e um brilho passa por cima. O contador segue o carregamento
   real (fontes, página e cena) e o espaço se abre a partir do buraco negro. */
export function Loader() {
  const { t } = useLang();
  const [n, setN] = useState(0);
  const [saindo, setSaindo] = useState(false);
  const fim = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("carregando")) {
      window.dispatchEvent(new Event("lp2-intro-fim"));
      return;
    }
    const t0 = performance.now();
    const tarefas = {
      fontes: false,
      pagina: document.readyState === "complete",
      cena: false,
    };
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
      const alvo = Math.min(
        dt / MIN,
        0.15 + 0.7 * feitas + (feitas === 1 ? 0.15 : 0),
      );
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
        {/* órbitas finas e uma luz prateada que gira (somem na faixa do nome) */}
        <div className="loader-anel absolute size-[min(560px,96vw)]">
          <svg className="loader-ring size-full" viewBox="0 0 560 560">
            <circle cx="280" cy="280" r="205" fill="none" stroke="rgba(214,226,245,.16)" />
            <circle cx="280" cy="280" r="272" fill="none" stroke="rgba(214,226,245,.08)" strokeDasharray="2 7" />
          </svg>
          <span className="loader-cometa" />
        </div>
        <div className="loader-name relative grid justify-items-center gap-6 text-center">
          <svg
            className="nome-intro w-[min(84vw,720px)] overflow-visible"
            viewBox={NOME.viewBox}
          >
            <defs>
              <linearGradient
                id="nome-prata"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={VY}
                x2="0"
                y2={VY + VH}
              >
                <stop offset="0" stopColor="#ffffff" />
                <stop offset=".22" stopColor="#eef3fa" />
                <stop offset=".44" stopColor="#b9c4d4" />
                <stop offset=".52" stopColor="#4f5b6c" />
                <stop offset=".58" stopColor="#c8d2e0" />
                <stop offset=".76" stopColor="#ffffff" />
                <stop offset="1" stopColor="#8e9aac" />
              </linearGradient>
              <linearGradient id="nome-brilho" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <clipPath id="nome-recorte">
                {NOME.letras.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </clipPath>
            </defs>
            <g className="nome-letras">
              {NOME.letras.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  pathLength={1}
                  style={{ "--i": i } as React.CSSProperties}
                />
              ))}
            </g>
            {/* o brilho que corre pelo nome, recortado no formato das letras */}
            <g clipPath="url(#nome-recorte)">
              <rect
                className="nome-brilho"
                x={VX - VW * 0.3}
                y={VY}
                width={VW * 0.24}
                height={VH}
                fill="url(#nome-brilho)"
              />
            </g>
          </svg>
          <span className="nome-linha" aria-hidden="true">
            <span />✦<span />
          </span>
          <p className="mono text-[0.7rem] tracking-[0.3em] text-muted uppercase">
            {t.loader.carregando}{" "}
            <span className="tabular-nums text-silver-hi">
              {String(n).padStart(3, "0")}
            </span>
          </p>
        </div>
      </div>
      <p className="mono absolute bottom-[max(24px,env(safe-area-inset-bottom))] text-[0.65rem] tracking-[0.2em] text-muted/80 uppercase">
        {t.loader.pular}
      </p>
    </div>
  );
}
