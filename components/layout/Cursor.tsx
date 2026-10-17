"use client";

import { useEffect, useRef } from "react";

/* Anel que segue o mouse com atraso suave e cresce sobre links e botões (só com mouse) */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    el.hidden = false;
    let x = -100,
      y = -100,
      cx = -100,
      cy = -100,
      raf = 0,
      parado = true;

    const loop = () => {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      // dorme quando chega no lugar
      if (Math.abs(x - cx) + Math.abs(y - cy) < 0.2) {
        parado = true;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
      const alvo = (e.target as Element | null)?.closest?.("a, button, [role=button], label, summary, [data-cursor]");
      el.dataset.hover = alvo ? "true" : "false";
      if (parado) {
        parado = false;
        raf = requestAnimationFrame(loop);
      }
    };
    const sai = () => (el.style.opacity = "0");
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", sai);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", sai);
    };
  }, []);

  return <div ref={ref} className="cursor" hidden style={{ opacity: 0 }} aria-hidden="true" />;
}
