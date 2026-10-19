"use client";

import { useEffect } from "react";

/* Motor de parallax da página inteira, num requestAnimationFrame só (e parado quando nada mexe):
   - camadas do espaço (Cosmos): cada uma rola numa velocidade e escorrega com o mouse;
   - galáxias soltas: passam pela tela devagar, as de longe mais devagar ainda;
   - [data-parallax="0.12"]: o elemento fica "mais longe" (rola 12% mais devagar), pelo `translate`
     (não briga com o `transform` das revelações);
   - hero: o mouse desloca as camadas do texto em profundidades diferentes (--px / --py);
   - [data-tilt]: cartões inclinam em 3D na direção do mouse, com um reflexo prateado.
   Com "reduzir movimento" nada se mexe sozinho: as galáxias só acompanham a rolagem normal. */

const suave = (atual: number, alvo: number, k: number) => atual + (alvo - atual) * k;

export function Parallax() {
  useEffect(() => {
    const html = document.documentElement;
    const cosmos = document.querySelector<HTMLElement>(".cosmos");
    if (!cosmos) return;
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseFino = matchMedia("(hover: hover) and (pointer: fine)").matches;

    const fundo = cosmos.querySelector<HTMLElement>('[data-camada="fundo"]');
    const camadas = [...cosmos.querySelectorAll<HTMLElement>("[data-camada]:not([data-camada='fundo'])")].map((el) => ({
      el,
      f: Number(el.dataset.camada),
      m: Number(el.dataset.mouse || 0),
      tile: 0,
    }));
    const galaxias = [...cosmos.querySelectorAll<HTMLElement>("[data-galaxia]")].map((el) => ({
      el,
      p: Number(el.dataset.p),
      f: reduzir ? 1 : Number(el.dataset.f),
      h: 0,
      vis: true,
    }));
    const hero = document.querySelector<HTMLElement>(".hero-stage");

    let vh = innerHeight;
    let maxScroll = 1;
    let alvos: { el: HTMLElement; centro: number; v: number }[] = [];

    const medir = () => {
      vh = innerHeight;
      maxScroll = Math.max(1, html.scrollHeight - vh);
      for (const c of camadas) c.tile = parseFloat(getComputedStyle(c.el).getPropertyValue("--tile")) || 512;
      for (const g of galaxias) g.h = g.el.offsetHeight || 300;
      // posição de cada [data-parallax] sem o deslocamento atual
      alvos = [...document.querySelectorAll<HTMLElement>("[data-parallax]")].map((el) => {
        el.style.translate = "";
        const r = el.getBoundingClientRect();
        return { el, centro: r.top + scrollY + r.height / 2, v: reduzir ? 0 : Number(el.dataset.parallax) || 0 };
      });
      pedir(true);
    };

    // mouse normalizado (-1 a 1) e a versão suavizada que vai para a tela
    let mx = 0;
    let my = 0;
    let sx = 0;
    let sy = 0;
    let ultimoY = -1;
    let raf = 0;
    let forcar = true;

    const quadro = () => {
      raf = 0;
      const y = scrollY;
      sx = suave(sx, mx, 0.07);
      sy = suave(sy, my, 0.07);
      const mexendoMouse = Math.abs(sx - mx) > 0.0005 || Math.abs(sy - my) > 0.0005;
      if (!forcar && !mexendoMouse && Math.abs(y - ultimoY) < 0.1) return;
      forcar = false;
      ultimoY = y;

      if (!reduzir) {
        // campo profundo: desce só um pouco ao longo da página inteira
        if (fundo) fundo.style.transform = `translate3d(${(-sx * 3).toFixed(2)}px, ${(-(y / maxScroll) * 0.07 * vh - sy * 3).toFixed(2)}px, 0)`;
        // estrelas: a rolagem "dá a volta" no mosaico (a camada tem um mosaico a mais de altura)
        for (const c of camadas) {
          const ty = -((y * c.f) % c.tile);
          c.el.style.transform = `translate3d(${(-sx * c.m).toFixed(2)}px, ${(ty - sy * c.m).toFixed(2)}px, 0)`;
        }
      }
      // galáxias: no meio da tela quando a rolagem chega em p; fora da tela ficam escondidas
      for (const g of galaxias) {
        const topo = vh / 2 + (g.p * maxScroll - y) * g.f - g.h / 2;
        const vis = topo > -g.h * 1.2 && topo < vh + g.h * 0.2;
        if (vis !== g.vis) {
          g.vis = vis;
          g.el.style.visibility = vis ? "" : "hidden";
        }
        if (vis) g.el.style.transform = `translate3d(calc(-50% + ${(-sx * 40 * g.f).toFixed(2)}px), ${(topo - sy * 30 * g.f).toFixed(1)}px, 0) rotate(var(--giro))`;
      }
      // elementos "mais longe" que o resto da página
      for (const a of alvos) {
        if (!a.v) continue;
        const d = a.centro - (y + vh / 2);
        if (Math.abs(d) > vh * 1.6) continue;
        a.el.style.translate = `0 ${(d * a.v).toFixed(1)}px`;
      }
      // hero: camadas do texto
      if (hero && y < vh * 2.2 && !reduzir) {
        hero.style.setProperty("--px", sx.toFixed(4));
        hero.style.setProperty("--py", sy.toFixed(4));
      }
      if (mexendoMouse) pedir();
    };
    const pedir = (f = false) => {
      if (f) forcar = true;
      if (!raf) raf = requestAnimationFrame(quadro);
    };

    const rolou = () => pedir();
    const moveu = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = (e.clientX / innerWidth) * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
      pedir();
    };

    // inclinação 3D dos cartões
    let ativo: HTMLElement | null = null;
    let rafTilt = 0;
    let ultimo: PointerEvent | null = null;
    const soltar = (el: HTMLElement) => {
      el.style.transition = "transform 0.9s var(--ease-out-expo)";
      el.style.transform = "";
      el.removeAttribute("data-tilt-on");
    };
    const inclinar = () => {
      rafTilt = 0;
      const e = ultimo;
      if (!e) return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-tilt]") ?? null;
      // só depois da revelação (antes disso o transform é da animação de entrada)
      const pronto = el && (!el.hasAttribute("data-reveal") || el.classList.contains("in")) ? el : null;
      if (pronto !== ativo) {
        if (ativo) soltar(ativo);
        ativo = pronto;
        if (pronto) {
          pronto.style.transition = "transform 0.25s var(--ease-out-expo)";
          pronto.setAttribute("data-tilt-on", "");
        }
      }
      if (!pronto) return;
      const r = pronto.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      const max = Number(pronto.dataset.tilt) || 6;
      pronto.style.transform = `perspective(1000px) rotateX(${((0.5 - y) * max).toFixed(2)}deg) rotateY(${((x - 0.5) * max).toFixed(2)}deg)`;
      pronto.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      pronto.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    };
    const tilt = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      ultimo = e;
      if (!rafTilt) rafTilt = requestAnimationFrame(inclinar);
    };
    const saiu = () => {
      if (ativo) soltar(ativo);
      ativo = null;
    };

    // as imagens do espaço só entram depois da intro (não disputam banda com o começo da página)
    const temIdle = "requestIdleCallback" in window; // o Safari antigo não tem
    let idle = 0;
    const ligar = () => {
      const go = () => {
        cosmos.setAttribute("data-on", "");
        medir();
      };
      idle = temIdle ? requestIdleCallback(go, { timeout: 1500 }) : window.setTimeout(go, 300);
    };
    if (!html.classList.contains("carregando")) ligar();
    else addEventListener("lp2-intro-fim", ligar, { once: true });

    medir();
    cosmos.setAttribute("data-pronto", "");
    addEventListener("scroll", rolou, { passive: true });
    addEventListener("resize", medir);
    addEventListener("load", medir);
    document.fonts?.ready.then(medir);
    // a página muda de altura (filtros, troca de idioma, imagens): mede de novo
    const ro = new ResizeObserver(() => medir());
    ro.observe(document.body);
    if (!reduzir) addEventListener("pointermove", moveu, { passive: true });
    if (mouseFino && !reduzir) {
      document.addEventListener("pointermove", tilt, { passive: true });
      document.documentElement.addEventListener("pointerleave", saiu);
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafTilt);
      if (temIdle) cancelIdleCallback(idle);
      else clearTimeout(idle);
      removeEventListener("lp2-intro-fim", ligar);
      removeEventListener("scroll", rolou);
      removeEventListener("resize", medir);
      removeEventListener("load", medir);
      removeEventListener("pointermove", moveu);
      document.removeEventListener("pointermove", tilt);
      document.documentElement.removeEventListener("pointerleave", saiu);
      ro.disconnect();
    };
  }, []);
  return null;
}
