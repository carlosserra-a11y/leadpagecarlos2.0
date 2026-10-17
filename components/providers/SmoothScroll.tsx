"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/* Lenis fica acessível para quem precisa rolar via código (galeria, botões) */
let instance: Lenis | null = null;
export const getLenis = () => instance;

const HEADER = 72; // altura do cabeçalho fixo

/** Rola até um elemento ou posição, com ou sem Lenis */
export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el === null) return;
  if (instance) {
    instance.scrollTo(el as HTMLElement | number, { offset: typeof el === "number" ? 0 : -HEADER, immediate });
    return;
  }
  const top = typeof el === "number" ? el : el.getBoundingClientRect().top + scrollY - HEADER;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollTo({ top, behavior: immediate || reduce ? "auto" : "smooth" });
}

export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: true,
      anchors: { offset: -HEADER },
      stopInertiaOnNavigate: true,
      // Diálogos e listas roláveis rolam sozinhos
      prevent: (node) => node.closest?.("dialog, [data-lenis-prevent]") !== null,
    });
    instance = lenis;
    document.documentElement.classList.add("lenis-on");
    return () => {
      lenis.destroy();
      instance = null;
      document.documentElement.classList.remove("lenis-on");
    };
  }, []);
  return null;
}
