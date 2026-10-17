"use client";

import { useEffect, useRef, useState } from "react";

/* Número que sobe uma vez. No HTML estático já vem o valor final (sem JS fica certo). */
export function Counter({ value, start = true, dur = 1300 }: { value: number; start?: boolean; dur?: number }) {
  const [n, setN] = useState(value);
  const ran = useRef(false);
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!start || ran.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = el.current;
    if (!node) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      ran.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setN(Math.round((1 - Math.pow(1 - t, 3)) * value));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [start, value, dur]);

  return (
    <span ref={el} className="tabular-nums">
      {n}
    </span>
  );
}
