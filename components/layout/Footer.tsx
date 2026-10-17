"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, ArrowUpRight, Mail } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/ui/BrandIcons";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { CONFIG, PROJETOS, ghLink, pagesLink, waLink } from "@/lib/dados";
import { useClock } from "@/lib/useClock";

export function Footer() {
  const { t } = useLang();
  const hora = useClock();
  const giant = useRef<HTMLDivElement>(null);

  // O nome gigante acende em dourado onde o mouse passa
  useEffect(() => {
    const el = giant.current;
    if (!el) return;
    const lit = el.querySelector<HTMLElement>(".lit")!;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.dataset.auto = "true";
      return;
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      lit.style.setProperty("--x", `${e.clientX - r.left}px`);
      lit.style.setProperty("--y", `${e.clientY - r.top}px`);
    };
    const enter = () => lit.style.setProperty("--r", "clamp(120px, 16vw, 260px)");
    const leave = () => lit.style.setProperty("--r", "0px");
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const mapa = [
    ["#topo", t.nav.inicio],
    ["#projetos", t.nav.projetos],
    ["#arquivo", t.arquivo.t],
    ["#servicos", t.nav.servicos],
    ["#processo", t.processo.k],
    ["#stack", t.stack.k],
    ["#sobre", t.nav.sobre],
    ["#contato", t.nav.contato],
  ] as const;

  return (
    <footer className="relative overflow-hidden border-t border-line bg-space pt-[clamp(80px,12vw,150px)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(242,193,78,.12),transparent_70%)]" />
      <div className="wrap relative grid gap-16">
        <div className="grid justify-items-center gap-6 text-center">
          <p className="kicker" data-reveal>
            <span aria-hidden="true">✦ </span>
            {t.rodape.status}: {t.rodape.statusV}
          </p>
          <h2 className="title gold-text text-[clamp(2.6rem,7vw,5.4rem)]" data-reveal>
            {t.rodape.q}
          </h2>
          <p className="lede text-lg" data-reveal>
            {t.rodape.p}
          </p>
          <MagneticLink href={waLink(t.contato.msg.padrao)} className="mt-2 min-h-14 px-8 text-base" data-reveal>
            <WhatsappIcon size={20} />
            {t.rodape.btn}
          </MagneticLink>
        </div>

        <div className="grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label={t.rodape.mapa}>
            <h3 className="kicker mb-4 text-muted">{t.rodape.mapa}</h3>
            <ul className="grid gap-1">
              {mapa.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="inline-flex min-h-9 items-center text-text/85 no-underline hover:text-gold-hi">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="kicker mb-4 text-muted">{t.rodape.contatos}</h3>
            <ul className="grid gap-1">
              <li>
                <a href={waLink(t.contato.msg.padrao)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-text/85 no-underline hover:text-gold-hi">
                  <WhatsappIcon size={15} /> {CONFIG.telefone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONFIG.email}`} className="inline-flex min-h-9 items-center gap-2 break-all text-text/85 no-underline hover:text-gold-hi">
                  <Mail size={15} aria-hidden="true" /> {CONFIG.email}
                </a>
              </li>
              <li>
                <a href={ghLink()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-text/85 no-underline hover:text-gold-hi">
                  <GithubIcon size={15} /> {CONFIG.github}
                </a>
              </li>
              {CONFIG.linkedin && (
                <li>
                  <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-text/85 no-underline hover:text-gold-hi">
                    <LinkedinIcon size={15} /> LinkedIn
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="kicker mb-4 text-muted">{t.rodape.noAr}</h3>
            <ul className="grid gap-1">
              {PROJETOS.map((p) => (
                <li key={p.slug}>
                  <a href={pagesLink(p.repo)} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-9 items-center gap-1.5 text-text/85 no-underline hover:text-gold-hi">
                    {p.nome}
                    <ArrowUpRight size={14} aria-hidden="true" className="opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                    <span className="sr-only">({t.geral.abreNovaAba})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="kicker mb-4 text-muted">{t.rodape.status}</h3>
            <p className="flex items-center gap-3 text-text/85">
              <span className="pulse-dot" aria-hidden="true" />
              {t.rodape.statusV}
            </p>
            <p className="mono mt-3 text-sm text-muted">
              {CONFIG.cidade} · <span className="tabular-nums text-gold-hi">{hora || "--:--"}</span> BRT
            </p>
            <p className="mono mt-1 text-xs text-muted">{CONFIG.coordenadas}</p>
          </div>
        </div>
      </div>

      <div ref={giant} className="giant mt-16 select-none" aria-hidden="true">
        <span className="outline">{CONFIG.nome}</span>
        <span className="lit">{CONFIG.nome}</span>
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-sm text-muted">
        <p>{t.rodape.assinatura}</p>
        <div className="flex items-center gap-5">
          <a href={ghLink(CONFIG.repoDoSite)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 no-underline hover:text-gold-hi">
            <GithubIcon size={15} /> {t.rodape.codigo}
          </a>
          <a
            href="#topo"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget(0);
              document.getElementById("conteudo")?.focus({ preventScroll: true });
            }}
            className="inline-flex min-h-11 items-center gap-2 no-underline hover:text-gold-hi"
          >
            <ArrowUp size={15} aria-hidden="true" /> {t.rodape.topo}
          </a>
        </div>
      </div>
    </footer>
  );
}
