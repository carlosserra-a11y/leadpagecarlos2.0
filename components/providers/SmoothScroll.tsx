"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lenis from "lenis";

/* Lenis fica acessível para quem precisa rolar via código (galeria, botões) */
let instance: Lenis | null = null;
export const getLenis = () => instance;

const HEADER = 72; // altura do cabeçalho fixo
const DURACAO = 1.1; // rolagens por código têm duração fixa (sempre terminam; ver o vigia abaixo)

/** Rola até um elemento ou posição, com ou sem Lenis */
export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (el === null) return;
  // posição inteira: o Lenis nunca termina uma animação para x,5 vinda de baixo
  let top: number;
  if (typeof el === "number") top = el;
  else {
    const margem = parseFloat(getComputedStyle(el).scrollMarginTop) || HEADER;
    top = el.getBoundingClientRect().top + scrollY - margem;
  }
  top = Math.max(0, Math.round(top));
  if (instance) {
    instance.scrollTo(top, { duration: DURACAO, immediate });
    return;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollTo({ top, behavior: immediate || reduce ? "auto" : "smooth" });
}

export function SmoothScroll() {
  const router = useRouter();
  useEffect(() => {
    // link "#secao" numa página que não tem a seção (a 404): vai para a seção na página inicial
    const ancoraFora = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const hash = a?.getAttribute("href") ?? "";
      if (!a || hash.length < 2 || hash.startsWith("#caso-") || document.getElementById(hash.slice(1))) return;
      e.preventDefault();
      e.stopPropagation();
      router.push(`/${hash}`);
    };
    document.addEventListener("click", ancoraFora, true);

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => document.removeEventListener("click", ancoraFora, true);
    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: true,
      // o Lenis já desconta o scroll-margin-top das seções (altura do cabeçalho)
      anchors: { duration: DURACAO },
      stopInertiaOnNavigate: true,
      // Diálogos e listas roláveis rolam sozinhos
      prevent: (node) => node.closest?.("dialog, [data-lenis-prevent]") !== null,
    });
    // Vigia: no modo lerp o Lenis só termina quando Math.round(atual) === Math.round(alvo); com alvo
    // terminado em ,5 (trackpad, telas de alta densidade) a animação fica presa para sempre a um fio do
    // destino, e o teclado deixa de rolar. Quando faltar menos de 0,05 px, encerra no inteiro mais próximo.
    lenis.on("scroll", (l: Lenis) => {
      if (l.isScrolling === "smooth" && Math.abs(l.targetScroll - l.animatedScroll) < 0.05 && l.targetScroll % 1 !== 0) {
        l.scrollTo(Math.round(l.targetScroll), { immediate: true, force: true });
      }
    });
    instance = lenis;
    // a classe não pode começar com "lenis-": o Lenis apaga essas a cada rolagem
    document.documentElement.classList.add("com-lenis");
    return () => {
      document.removeEventListener("click", ancoraFora, true);
      lenis.destroy();
      instance = null;
      document.documentElement.classList.remove("com-lenis");
    };
  }, [router]);
  return null;
}
