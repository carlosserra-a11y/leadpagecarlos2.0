"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { PROJETOS, ghLink, pagesLink } from "@/lib/dados";
import type { Tier } from "@/lib/useDeviceTier";

const ProjectOrbit = dynamic(() => import("@/components/three/ProjectOrbit"), { ssr: false });

export type Progresso = { p: number };
const N = PROJETOS.length;
const POR_PROJETO = 75; // svh de rolagem por projeto

/* Seção fixada: a rolagem gira a órbita e traz um projeto por vez para a frente */
export function Galaxia({ onOpen, tier }: { onOpen: (i: number) => void; tier: Tier | null }) {
  const { t, lang } = useLang();
  const track = useRef<HTMLDivElement>(null);
  const prog = useRef<Progresso>({ p: 0 });
  const [ativo, setAtivo] = useState(0);
  const [montar, setMontar] = useState(false);
  const [naTela, setNaTela] = useState(false);

  useEffect(() => {
    const el = track.current!;
    const perto = new IntersectionObserver(([e]) => e.isIntersecting && setMontar(true), { rootMargin: "120% 0px" });
    const dentro = new IntersectionObserver(([e]) => setNaTela(e.isIntersecting), { rootMargin: "-40% 0px -40% 0px" });
    perto.observe(el);
    dentro.observe(el);
    let raf = 0;
    const scroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
        prog.current.p = p;
        setAtivo(Math.round(p * (N - 1)));
      });
    };
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    return () => {
      perto.disconnect();
      dentro.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
    };
  }, []);

  const irPara = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const alvo = Math.max(0, Math.min(N - 1, i));
    const top = el.getBoundingClientRect().top + scrollY;
    scrollToTarget(top + (alvo / (N - 1)) * (el.offsetHeight - innerHeight) + 2);
  }, []);

  // ← → navegam quando a galáxia está na tela (e nenhum diálogo aberto)
  useEffect(() => {
    if (!naTela) return;
    const key = (e: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        irPara(ativo + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        irPara(ativo - 1);
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [naTela, ativo, irPara]);

  const p = PROJETOS[ativo];
  const x = p[lang];

  return (
    <div ref={track} className="galaxy-track mt-6" style={{ height: `${N * POR_PROJETO + 100}svh` }}>
      <div className="galaxy-stage">
        {montar && (
          <div className="absolute inset-0" aria-hidden="true">
            <ProjectOrbit prog={prog} ativo={ativo} tier={tier} onPick={(i) => (i === ativo ? onOpen(i) : irPara(i))} />
          </div>
        )}

        <div className="wrap pointer-events-none relative flex h-full items-center justify-end pt-[var(--header-h)]">
          <div className="pointer-events-auto w-[min(440px,40vw)]">
                {/* a chave troca o painel inteiro: o CSS anima a entrada de cada projeto */}
                <article
                  key={p.slug}
                  className="painel-entra glass glass-gold grid gap-4 rounded-[24px] p-7"
                  aria-labelledby="galaxia-nome"
                  aria-live="polite"
                >
                  <p className="mono flex items-center justify-between text-xs tracking-[0.2em] text-muted">
                    <span>
                      <span className="text-gold-hi">0{ativo + 1}</span> {t.projetos.de} 0{N}
                    </span>
                    <span className="text-gold">{x.tag}</span>
                  </p>
                  <div>
                    <p className="kicker text-[0.68rem] text-muted">{x.cliente}</p>
                    <h3 id="galaxia-nome" className="title mt-2 text-[2.4rem] text-text">
                      {p.nome}
                    </h3>
                  </div>
                  <div>
                    <p className="kicker mb-1.5 text-[0.66rem]">{t.projetos.desafio}</p>
                    <p className="text-[0.95rem] text-text/80">{x.desafio}</p>
                  </div>
                  <div>
                    <p className="kicker mb-1.5 text-[0.66rem]">{t.projetos.feito}</p>
                    <ul className="grid gap-1.5 text-[0.92rem] text-text/80">
                      {x.feito.slice(0, 3).map((f) => (
                        <li key={f} className="flex gap-2.5">
                          <span className="mt-[0.55em] size-1.5 flex-none rounded-full bg-gold" aria-hidden="true" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <ul className="flex flex-wrap gap-1.5" aria-label={t.projetos.stack}>
                    {p.stack.map((s) => (
                      <li key={s} className="tag">
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                    <button type="button" className="btn btn-gold btn-sm" onClick={() => onOpen(ativo)}>
                      {t.projetos.caso}
                    </button>
                    <a href={pagesLink(p.repo)} target="_blank" rel="noopener noreferrer" className="link-arrow text-sm">
                      {t.projetos.live} <ArrowUpRight size={15} aria-hidden="true" />
                      <span className="sr-only">({t.geral.abreNovaAba})</span>
                    </a>
                    <a href={ghLink(p.repo)} target="_blank" rel="noopener noreferrer" className="link-arrow text-sm">
                      <GithubIcon size={14} /> {t.projetos.code}
                      <span className="sr-only">({t.geral.abreNovaAba})</span>
                    </a>
                  </div>
                </article>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button type="button" onClick={() => irPara(ativo - 1)} disabled={ativo === 0} className="grid size-11 place-items-center rounded-full border border-line bg-void/40 backdrop-blur hover:border-gold disabled:opacity-35" aria-label={t.projetos.prev}>
                    <ArrowLeft size={18} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => irPara(ativo + 1)} disabled={ativo === N - 1} className="grid size-11 place-items-center rounded-full border border-line bg-void/40 backdrop-blur hover:border-gold disabled:opacity-35" aria-label={t.projetos.next}>
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
                <ol className="flex items-center" aria-label={t.projetos.k}>
                  {PROJETOS.map((q, i) => (
                    <li key={q.slug}>
                      <button
                        type="button"
                        onClick={() => irPara(i)}
                        aria-current={i === ativo ? "true" : undefined}
                        aria-label={q.nome}
                        className="grid size-11 place-items-center"
                      >
                        <span className={`block h-1.5 rounded-full transition-all duration-500 ${i === ativo ? "w-6 bg-gold" : "w-1.5 bg-white/30"}`} />
                      </button>
                    </li>
                  ))}
                </ol>
                <span className="mono hidden text-[0.65rem] tracking-[0.2em] text-muted uppercase xl:inline" aria-hidden="true">
                  {t.projetos.dica}
                </span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
