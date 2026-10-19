"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { Counter } from "@/components/ui/Counter";
import { asset } from "@/lib/asset";
import { CONFIG, REPOS } from "@/lib/dados";
import { useClock } from "@/lib/useClock";
import { useDeviceTier, usePrefersReducedMotion } from "@/lib/useDeviceTier";
import { heroState } from "./heroState";
import { Protecao3D } from "@/components/three/Protecao";

/* O canvas 3D só baixa depois da primeira pintura, e nunca no servidor */
const SpaceVortexCanvas = dynamic(() => import("./SpaceVortexCanvas"), { ssr: false });

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* Hero "Horizonte de Eventos": adaptação do prompt de referência (buraco negro + disco de acreção),
   com o nome em gótica e os dois caminhos (cliente e recrutador) logo no topo. */
export function CosmicHero() {
  const { t } = useLang();
  const tier = useDeviceTier();
  const reduce = usePrefersReducedMotion();
  const hora = useClock();
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ui = useRef<HTMLDivElement>(null);
  const voidRef = useRef<HTMLDivElement>(null);
  const poster = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const [montar3d, setMontar3d] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [entrou, setEntrou] = useState(false);

  const dolly = tier !== null && !reduce;

  // Entrada da interface depois da intro
  useEffect(() => {
    const go = () => setEntrou(true);
    if (!document.documentElement.classList.contains("carregando")) go();
    addEventListener("lp2-intro-fim", go);
    return () => removeEventListener("lp2-intro-fim", go);
  }, []);

  // O pôster (um quadro da própria cena) aparece na hora. O 3D pesado só baixa na primeira
  // interação (mouse, toque, rolagem ou tecla) e entra por cima com um fade, quando o navegador folga.
  useEffect(() => {
    if (!tier) return;
    dispatchEvent(new Event("lp2-cena")); // para a intro: a cena já está na tela, em pôster
    if (tier === "off") return;
    const EVENTOS = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
    const temIdle = "requestIdleCallback" in window; // o Safari antigo não tem
    let id = 0;
    const iniciar = () => {
      EVENTOS.forEach((ev) => removeEventListener(ev, iniciar));
      id = temIdle ? requestIdleCallback(() => setMontar3d(true), { timeout: 600 }) : window.setTimeout(() => setMontar3d(true), 120);
    };
    EVENTOS.forEach((ev) => addEventListener(ev, iniciar, { passive: true }));
    return () => {
      EVENTOS.forEach((ev) => removeEventListener(ev, iniciar));
      if (temIdle) cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [tier]);

  // Ponteiro (parallax) e rolagem (dolly zoom, interface some, passagem pelo horizonte)
  useEffect(() => {
    const st = stage.current!;
    heroState.bhY = parseFloat(getComputedStyle(st).getPropertyValue("--bh-y")) || 0.34;

    const pointer = (e: PointerEvent) => {
      heroState.px = (e.clientX / innerWidth) * 2 - 1;
      heroState.py = (e.clientY / innerHeight) * 2 - 1;
    };
    // celular: inclinação do aparelho, se o navegador entregar sem pedir permissão
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      heroState.px = Math.max(-1, Math.min(1, e.gamma / 30));
      heroState.py = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };

    let raf = 0;
    const scroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = track.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const total = Math.max(1, r.height - innerHeight);
        const p = dolly ? Math.min(1, Math.max(0, -r.top / total)) : 0;
        heroState.p = p;
        const fade = smooth(0.02, 0.38, p);
        if (ui.current) {
          ui.current.style.opacity = String(1 - fade);
          ui.current.style.transform = `translate3d(0, ${(-70 * fade).toFixed(1)}px, 0) scale(${(1 - 0.06 * fade).toFixed(3)})`;
          ui.current.style.filter = fade > 0.01 ? `blur(${(10 * fade).toFixed(1)}px)` : "";
          ui.current.style.visibility = fade > 0.99 ? "hidden" : "";
        }
        if (hud.current) hud.current.style.opacity = String(1 - smooth(0, 0.2, p));
        if (voidRef.current) voidRef.current.style.opacity = String(smooth(0.68, 0.98, p));
        // sem 3D, o pôster faz o zoom
        if (poster.current) poster.current.style.transform = p > 0 ? `scale(${(1 + 0.9 * smooth(0, 1, p)).toFixed(3)})` : "";
      });
    };
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", scroll);
    addEventListener("pointermove", pointer, { passive: true });
    if (matchMedia("(pointer: coarse)").matches) addEventListener("deviceorientation", tilt);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", scroll);
      removeEventListener("pointermove", pointer);
      removeEventListener("deviceorientation", tilt);
    };
  }, [dolly]);

  const totalRepos = REPOS.length;

  return (
    <section id="topo" ref={track} aria-labelledby="hero-titulo" className="hero-track" data-dolly={dolly}>
      <div ref={stage} className="hero-stage">
        <div ref={poster} className="hero-poster" style={{ transformOrigin: "50% calc(var(--bh-y) * 100%)" }}>
          <picture>
            <source media="(max-width: 767px)" type="image/avif" srcSet={asset("/hero/poster-mob.avif")} />
            <source media="(max-width: 767px)" type="image/webp" srcSet={asset("/hero/poster-mob.webp")} />
            <source type="image/avif" srcSet={asset("/hero/poster.avif")} />
            <img src={asset("/hero/poster.webp")} alt="" width={1600} height={1000} decoding="async" fetchPriority="low" />
          </picture>
        </div>

        {montar3d && tier && tier !== "off" && (
          <div className="hero-canvas" data-pronto={pronto} aria-hidden="true">
            <Protecao3D>
              <SpaceVortexCanvas tier={tier} trackRef={track} onPronto={() => setPronto(true)} />
            </Protecao3D>
          </div>
        )}

        <div className="hero-vignette" aria-hidden="true" />

        <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-[clamp(56px,9svh,110px)] pt-[calc(var(--header-h)+8px)]">
          <div ref={ui} className="hero-ui grid justify-items-center gap-[clamp(10px,1.6svh,18px)] text-center will-change-transform" data-in={entrou}>
            <p className="hero-badge glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.82rem] text-text/90 sm:text-sm" style={{ "--i": 0, "--d": 12 } as React.CSSProperties}>
              <span className="pulse-dot" aria-hidden="true" />
              <span aria-hidden="true" className="text-silver">✦</span>
              {t.hero.badge}
            </p>

            <h1 id="hero-titulo" className="hero-h1 gothic chrome-text" style={{ "--i": 1, "--d": 26 } as React.CSSProperties}>
              {CONFIG.nome}
            </h1>

            <p className="hero-role mono text-[0.72rem] tracking-[0.28em] text-silver-hi/80 uppercase sm:text-[0.78rem]" style={{ "--i": 2, "--d": 16 } as React.CSSProperties}>
              {t.hero.role} · {CONFIG.cidade}
            </p>

            <p className="title text-[clamp(1.45rem,3.4vw,2.2rem)] text-text" style={{ "--i": 3, "--d": 12 } as React.CSSProperties}>
              {t.hero.tagline}
            </p>

            <p className="hero-lede lede max-w-[46ch] text-[clamp(0.98rem,1.4vw,1.12rem)] text-text/75" style={{ "--i": 4, "--d": 8 } as React.CSSProperties}>
              {t.hero.sub}
            </p>

            <div className="mt-1 flex flex-wrap items-center justify-center gap-3" style={{ "--i": 5, "--d": 5 } as React.CSSProperties}>
              <MagneticLink href="#contato" data-assunto="projeto" className="min-w-[11rem]">
                {t.hero.ctaSite}
              </MagneticLink>
              <MagneticLink href="#projetos" variant="ghost" className="min-w-[10rem]">
                {t.hero.ctaProj}
              </MagneticLink>
              <a href="#recrutador" data-assunto="vaga" className="link-arrow px-2">
                {t.hero.ctaRec}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <dl className="hero-stats mono mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-[0.72rem] tracking-[0.14em] text-muted uppercase" style={{ "--i": 6, "--d": 4 } as React.CSSProperties}>
              <div className="flex items-baseline gap-2">
                <dt className="order-2">{t.hero.n1}</dt>
                <dd className="order-1 text-base text-silver-hi">
                  <Counter value={CONFIG.numeros.clientes} start={entrou} />
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="order-2">{t.hero.n2}</dt>
                <dd className="order-1 text-base text-silver-hi">
                  <Counter value={CONFIG.numeros.sites} start={entrou} />
                </dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="order-2">{t.hero.n3}</dt>
                <dd className="order-1 text-base text-silver-hi">
                  <Counter value={totalRepos} start={entrou} />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* HUD discreto */}
        <div ref={hud} className="hud pointer-events-none absolute inset-x-0 bottom-0 hidden items-end justify-between px-[clamp(16px,4vw,40px)] pb-5 md:flex" aria-hidden="true">
          <span>
            {CONFIG.coordenadas} · Palhoça
          </span>
          <span className="flex flex-col items-center gap-2">
            <span className="scroll-cue" />
            {t.hero.scroll}
          </span>
          <span>
            RA 17h45m · DEC −29° · <span className="tabular-nums">{hora || "--:--"}</span> BRT
          </span>
        </div>

        <div ref={voidRef} className="hero-void" aria-hidden="true" />
      </div>
    </section>
  );
}
