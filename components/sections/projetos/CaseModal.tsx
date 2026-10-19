"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { getLenis } from "@/components/providers/SmoothScroll";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { asset } from "@/lib/asset";
import { PROJETOS, ghLink, pagesLink } from "@/lib/dados";

/* Safari antes do 15.4 não tem showModal/close: lá o diálogo abre pelo atributo e fecha do mesmo jeito */
function fecharDialogo(d: HTMLDialogElement) {
  if (typeof d.close === "function") d.close();
  else {
    d.removeAttribute("open");
    d.dispatchEvent(new Event("close"));
  }
}

/* Estudo de caso em <dialog> nativo: foco preso, Esc fecha, foco volta para quem abriu */
export function CaseModal({ index, onChange, onClose }: { index: number | null; onChange: (i: number) => void; onClose: () => void }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const aberto = index !== null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      getLenis()?.stop();
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
      d.scrollTop = 0;
      dispatchEvent(new Event("lp2-modal"));
    } else if (!aberto && d.open) {
      fecharDialogo(d);
    }
  }, [aberto]);

  // Ao fechar por qualquer caminho (Esc, botão, fundo): solta a rolagem e devolve o foco
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const fechou = () => {
      getLenis()?.start();
      dispatchEvent(new Event("lp2-modal"));
      onClose();
      const o = opener.current;
      if (o && o.isConnected) o.focus({ preventScroll: true });
      opener.current = null;
    };
    d.addEventListener("close", fechou);
    return () => d.removeEventListener("close", fechou);
  }, [onClose]);

  // ← → trocam de projeto dentro do modal
  useEffect(() => {
    if (!aberto) return;
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input, textarea")) return;
      if (e.key === "ArrowRight") onChange(((index ?? 0) + 1) % PROJETOS.length);
      if (e.key === "ArrowLeft") onChange(((index ?? 0) - 1 + PROJETOS.length) % PROJETOS.length);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [aberto, index, onChange]);

  useEffect(() => {
    if (aberto) ref.current?.scrollTo({ top: 0 });
  }, [index, aberto]);

  const p = PROJETOS[index ?? 0];
  const x = p[lang];
  const n = PROJETOS.length;
  const prev = PROJETOS[((index ?? 0) - 1 + n) % n];
  const next = PROJETOS[((index ?? 0) + 1) % n];

  return (
    <dialog
      ref={ref}
      className="case"
      aria-labelledby="caso-titulo"
      data-lenis-prevent
      onClick={(e) => {
        // clique fora do conteúdo (no fundo) fecha
        if (e.target === ref.current) fecharDialogo(ref.current);
      }}
    >
      {aberto && (
        <div className="grid gap-8 p-[clamp(20px,4vw,48px)]">
          <div className="sticky top-0 z-10 -mx-[clamp(20px,4vw,48px)] -mt-[clamp(20px,4vw,48px)] flex items-start justify-between gap-4 bg-[#06101d]/90 px-[clamp(20px,4vw,48px)] pb-4 pt-[clamp(20px,4vw,48px)] backdrop-blur">
            <div>
              <p className="kicker text-[0.7rem]">
                {x.cliente} · {x.tag}
              </p>
              <h3 id="caso-titulo" className="title mt-2 text-[clamp(2rem,5vw,3.4rem)] text-text">
                {p.nome}
              </h3>
            </div>
            <button type="button" onClick={() => ref.current && fecharDialogo(ref.current)} className="grid size-11 flex-none place-items-center rounded-full border border-line hover:border-silver" aria-label={t.caso.fechar} autoFocus>
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <p className="text-lg text-text/85">{x.pitch}</p>

          <div className="grid items-start gap-4 md:grid-cols-[1fr_auto]">
            <figure className="shot-frame">
              <img src={asset(`/projetos/${p.shot}-1-1280.webp`)} width={1280} height={800} alt={`${t.caso.captura} ${p.nome} · ${t.caso.computador}`} loading="lazy" decoding="async" />
            </figure>
            <figure className="shot-frame mx-auto w-[min(220px,60vw)] rounded-[22px]">
              <img src={asset(`/projetos/${p.shot}-mob.webp`)} width={390} height={844} alt={`${t.caso.captura} ${p.nome} · ${t.caso.celular}`} loading="lazy" decoding="async" />
            </figure>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="kicker mb-3">{t.caso.desafio}</h4>
              <p className="text-text/80">{x.desafio}</p>
            </div>
            <div>
              <h4 className="kicker mb-3">{t.caso.conferir}</h4>
              <p className="text-text/80">{x.prova}</p>
            </div>
            <div>
              <h4 className="kicker mb-3">{t.caso.solucao}</h4>
              <ul className="grid gap-2 text-text/80">
                {x.feito.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-[0.55em] size-1.5 flex-none rounded-full bg-silver" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="kicker mb-3">{t.caso.decisoes}</h4>
              <ul className="grid gap-2 text-text/80">
                {x.decisoes.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-[0.55em] size-1.5 flex-none rounded-full bg-ice" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {p.longa && (
            <div>
              <h4 className="kicker mb-3">{t.caso.paginaInteira}</h4>
              <div className="shot-frame max-h-[70svh] overflow-y-auto" tabIndex={0} aria-label={`${t.caso.paginaInteira} · ${p.nome}`}>
                <img src={asset(`/projetos/${p.shot}-longa.webp`)} width={960} height={1700} alt={`${t.caso.captura} ${p.nome} · ${t.caso.paginaInteira}`} loading="lazy" decoding="async" className="h-auto w-full" />
              </div>
            </div>
          )}

          {p.evolucao && (
            <div>
              <h4 className="kicker mb-3">{t.caso.evolucao}</h4>
              <ol className="grid gap-3 sm:grid-cols-3">
                {p.evolucao.map((v) => (
                  <li key={v.v} className="glass rounded-2xl p-4">
                    <p className="gothic chrome-text text-3xl">v{v.v}</p>
                    <p className="mt-2 text-sm text-text/75">{v.txt[lang]}</p>
                    <a href={ghLink(v.repo)} target="_blank" rel="noopener noreferrer" className="link-arrow mt-1 text-sm">
                      {v.repo}
                      <ArrowUpRight size={14} aria-hidden="true" />
                      <span className="sr-only">({t.geral.abreNovaAba})</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div>
            <h4 className="kicker mb-3">{t.caso.stack}</h4>
            <ul className="flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="tag">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <a href={pagesLink(p.repo)} target="_blank" rel="noopener noreferrer" className="btn btn-chrome">
              {t.projetos.live} <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only">({t.geral.abreNovaAba})</span>
            </a>
            <a href={ghLink(p.repo)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <GithubIcon size={16} /> {t.projetos.code}
              <span className="sr-only">({t.geral.abreNovaAba})</span>
            </a>
            <div className="ms-auto flex gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(((index ?? 0) - 1 + n) % n)}>
                <ArrowLeft size={16} aria-hidden="true" />
                <span className="sr-only">{t.projetos.prev}:</span> {prev.nome}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(((index ?? 0) + 1) % n)}>
                <span className="sr-only">{t.projetos.next}:</span> {next.nome}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
