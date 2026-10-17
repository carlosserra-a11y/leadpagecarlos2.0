"use client";

import { useEffect } from "react";

/* Um observador só para a página toda: acende [data-reveal] e .words quando entram na tela.
   Também pega elementos que aparecem depois (filtros, troca de idioma). */
export function RevealObserver() {
  useEffect(() => {
    const SEL = "[data-reveal]:not(.in), .words:not(.in)";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const showAll = () => document.querySelectorAll(SEL).forEach((el) => el.classList.add("in"));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll(SEL).forEach((el) => io.observe(el));
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
