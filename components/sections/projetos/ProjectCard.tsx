"use client";

import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { type Projeto, ghLink, pagesLink } from "@/lib/dados";
import { Shot } from "./Shot";

/* Cartão usado no carrossel do celular e na grade sem 3D (é também a versão sem JavaScript) */
export function ProjectCard({ p, i, onOpen }: { p: Projeto; i: number; onOpen: (i: number, el: HTMLElement) => void }) {
  const { t, lang } = useLang();
  const x = p[lang];
  return (
    <article className="glass group relative flex flex-col overflow-hidden rounded-[22px]" aria-labelledby={`card-${p.slug}`} data-reveal style={{ "--d": i } as React.CSSProperties}>
      <div className="shot-frame m-2 mb-0 rounded-[16px]">
        <Shot shot={p.shot} alt={`${t.caso.captura} ${p.nome}`} className="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
        <span className="mono absolute left-3 top-3 rounded-full bg-void/70 px-2.5 py-1 text-[0.68rem] tracking-widest text-gold-hi backdrop-blur">
          0{i + 1}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="kicker text-[0.68rem] text-muted">
          {x.cliente} · <span className="text-gold">{x.tag}</span>
        </p>
        <h3 id={`card-${p.slug}`} className="title text-[1.7rem] text-text">
          {p.nome}
        </h3>
        <p className="text-[0.97rem] text-text/75">{x.pitch}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5" aria-label={t.projetos.stack}>
          {p.stack.slice(0, 4).map((s) => (
            <li key={s} className="tag">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3">
          <button type="button" className="needs-js btn btn-gold btn-sm" onClick={(e) => onOpen(i, e.currentTarget)}>
            {t.projetos.caso}
          </button>
          <a href={pagesLink(p.repo)} target="_blank" rel="noopener noreferrer" className="link-arrow text-sm">
            {t.projetos.live}
            <ArrowUpRight size={15} aria-hidden="true" />
            <span className="sr-only">({t.geral.abreNovaAba})</span>
          </a>
          <a href={ghLink(p.repo)} target="_blank" rel="noopener noreferrer" className="link-arrow text-sm">
            <GithubIcon size={14} />
            {t.projetos.code}
            <span className="sr-only">({t.geral.abreNovaAba})</span>
          </a>
        </div>
      </div>
    </article>
  );
}
