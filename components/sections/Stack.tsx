"use client";

import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { STACK, ghLink } from "@/lib/dados";
import { rng } from "@/lib/rng";

/* Posições das estrelas: pseudoaleatórias mas fixas (o HTML do build e o do navegador batem) */
function constelacao(seed: number, n: number) {
  const rnd = rng(seed);
  const W = 300;
  const pts = Array.from({ length: n }, (_, i) => ({
    x: 22 + ((i + 0.15 + rnd() * 0.7) / n) * (W - 44),
    y: i % 2 === 0 ? 40 + rnd() * 20 : 80 + rnd() * 22, // faixas alternadas: os nomes não se encostam
    r: 1.6 + rnd() * 1.8,
  }));
  return pts;
}

export function Stack() {
  const { t, lang } = useLang();
  return (
    <section id="stack" aria-labelledby="stack-t" className="section">
      <div className="wrap grid gap-14">
        <SectionHead id="stack-t" k={t.stack.k} t={t.stack.t} p={t.stack.p} />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STACK.map((area, i) => {
            const pts = constelacao(i * 7919 + 11, area.techs.length);
            return (
              <li key={area.id} className="constel-card glass group grid gap-4 rounded-[24px] p-6" data-reveal data-tilt="8" style={{ "--d": i % 3 } as React.CSSProperties}>
                <svg className="constel h-[140px] w-full" viewBox="0 0 300 140" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
                  {pts.slice(1).map((pt, j) => (
                    <line key={j} x1={pts[j].x} y1={pts[j].y} x2={pt.x} y2={pt.y} pathLength={1} style={{ "--i": j } as React.CSSProperties} />
                  ))}
                  {pts.map((pt, j) => (
                    <g key={j}>
                      <circle cx={pt.x} cy={pt.y} r={pt.r * 3.2} fill="rgba(176,208,255,.08)" className="!fill-[rgba(176,208,255,.08)]" />
                      <circle cx={pt.x} cy={pt.y} r={pt.r} />
                      <text x={pt.x} y={pt.y + (j % 2 === 0 ? -11 : 19)} textAnchor="middle" className="fill-muted font-mono text-[9px] tracking-wider transition-colors group-hover:fill-silver-hi">
                        {area.techs[j]}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="title text-[1.8rem] text-text">{area.titulo[lang]}</h3>
                  <span className="mono text-xs text-muted">0{i + 1}</span>
                </div>
                <p className="text-[0.95rem] text-text/70">{area.detalhe[lang]}</p>
                <p className="sr-only">{area.techs.join(", ")}</p>
                <a href={ghLink(area.prova)} target="_blank" rel="noopener noreferrer" className="link-arrow text-sm">
                  {t.stack.ver} {area.prova}
                  <ArrowUpRight size={15} aria-hidden="true" />
                  <span className="sr-only">({t.geral.abreNovaAba})</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
