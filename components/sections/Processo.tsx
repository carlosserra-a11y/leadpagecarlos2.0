"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { PROCESSO } from "@/lib/dados";

/* Linha do tempo: a órbita vai sendo traçada com a rolagem e cada etapa acende quando chega.
   Só um listener de rolagem e transform no traço (roda no compositor). */
export function Processo() {
  const { t, lang } = useLang();
  const lista = useRef<HTMLOListElement>(null);
  const traco = useRef<HTMLSpanElement>(null);
  const [acesas, setAcesas] = useState(0);

  useEffect(() => {
    const el = lista.current;
    if (!el) return;
    let raf = 0;
    const atualizar = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        // começa quando o topo da lista passa de 75% da tela e termina quando o fim passa de 55%
        const inicio = innerHeight * 0.75;
        const fim = innerHeight * 0.55;
        const p = Math.min(1, Math.max(0, (inicio - r.top) / (inicio - fim + r.height)));
        if (traco.current) traco.current.style.transform = `scaleY(${p.toFixed(4)})`;
        setAcesas(Math.min(PROCESSO.length, Math.floor(p * PROCESSO.length + 0.35)));
      });
    };
    atualizar();
    addEventListener("scroll", atualizar, { passive: true });
    addEventListener("resize", atualizar);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", atualizar);
      removeEventListener("resize", atualizar);
    };
  }, []);

  return (
    <section id="processo" aria-labelledby="processo-t" className="section">
      <div className="wrap grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)] lg:self-start">
          <SectionHead id="processo-t" k={t.processo.k} t={t.processo.t} p={t.processo.p} />
        </div>

        <ol ref={lista} className="relative grid gap-10 pl-14">
          {/* a órbita: trilho apagado + traço prateado que cresce com a rolagem */}
          <span aria-hidden="true" className="absolute bottom-3 left-[19px] top-3 w-px bg-white/10" />
          <span
            ref={traco}
            aria-hidden="true"
            className="absolute bottom-3 left-[19px] top-3 w-px origin-top bg-gradient-to-b from-silver-hi via-silver to-cosmic shadow-[0_0_14px_rgba(176,208,255,.7)] transition-transform duration-300 ease-out"
            style={{ transform: "scaleY(0)" }}
          />
          {PROCESSO.map((etapa, i) => (
            <li key={etapa.titulo.pt} className="orbit-step relative" data-on={i < acesas}>
              <span aria-hidden="true" className="orbit-dot absolute -left-14 top-1 grid size-10 place-items-center rounded-full border border-white/20 bg-void" />
              <p className="orbit-n mono text-xs tracking-[0.24em] text-muted">0{i + 1}</p>
              <h3 className="title mt-1 text-[clamp(1.8rem,3.6vw,2.6rem)] text-text">{etapa.titulo[lang]}</h3>
              <p className="lede mt-2">{etapa.texto[lang]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
