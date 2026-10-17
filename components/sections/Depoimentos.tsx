"use client";

import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { DEPOIMENTOS } from "@/lib/dados";

/* Só aparece com depoimento real em dados.ts (com autorização do cliente). Lista vazia = seção some. */
export function Depoimentos() {
  const { lang } = useLang();
  if (DEPOIMENTOS.length === 0) return null;
  return (
    <section id="depoimentos" aria-labelledby="depoimentos-t" className="section">
      <div className="wrap grid gap-12">
        <SectionHead id="depoimentos-t" k={lang === "pt" ? "Depoimentos" : "Testimonials"} t={lang === "pt" ? "Quem já entrou na órbita" : "Who already entered the orbit"} />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DEPOIMENTOS.map((d, i) => (
            <li key={d.nome} className="glass rounded-[24px] p-6" data-reveal style={{ "--d": i } as React.CSSProperties}>
              <figure className="grid gap-4">
                <blockquote className="text-lg text-text/85">“{d.texto[lang]}”</blockquote>
                <figcaption className="text-sm">
                  <span className="font-semibold text-text">{d.nome}</span> <span className="text-muted">· {d.negocio}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
