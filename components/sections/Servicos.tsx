"use client";

import { Building, Check, LayoutDashboard, Rocket, ShoppingBag, type LucideIcon } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { DIFERENCIAIS, PACOTES, PROJETOS, type Pacote } from "@/lib/dados";

const ICONES: Record<Pacote["icone"], LucideIcon> = { Rocket, Building2: Building, ShoppingBag, LayoutDashboard };

/* Pacotes para vender sites. Preço só aparece se estiver em dados.ts (nunca inventado). */
export function Servicos() {
  const { t, lang } = useLang();

  const pedir = (id: Pacote["id"]) => {
    window.dispatchEvent(new CustomEvent("lp2-briefing", { detail: { assunto: "projeto", tipo: id } }));
  };

  return (
    <section id="servicos" aria-labelledby="servicos-t" className="section">
      <div aria-hidden="true" data-parallax="0.3" className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_85%_30%,rgba(176,208,255,.07),transparent),radial-gradient(40%_50%_at_10%_80%,rgba(158,197,255,.06),transparent)]" />
      <div className="wrap relative grid gap-14">
        <SectionHead id="servicos-t" k={t.servicos.k} t={t.servicos.t} p={t.servicos.p} />

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PACOTES.map((pk, i) => {
            const Icone = ICONES[pk.icone];
            const ex = PROJETOS.find((p) => p.slug === pk.exemplo);
            return (
              <li key={pk.id} className="glass glass-chrome group relative flex flex-col gap-5 overflow-hidden rounded-[24px] p-6 transition-transform duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-1.5" data-reveal data-tilt="8" style={{ "--d": i } as React.CSSProperties}>
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(176,208,255,.18),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl border border-silver/30 bg-silver/10 text-silver">
                    <Icone size={22} aria-hidden="true" />
                  </span>
                  <span className="mono text-xs text-muted">0{i + 1}</span>
                </div>
                <div>
                  <h3 className="title text-[1.9rem] text-text">{pk.nome[lang]}</h3>
                  <p className="mt-2 text-[0.95rem] text-text/70">{pk.resumo[lang]}</p>
                </div>
                <ul className="grid gap-2 text-[0.93rem] text-text/85">
                  {pk.inclui[lang].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <Check size={16} className="mt-1 flex-none text-silver" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto grid gap-3 border-t border-line pt-4">
                  <p className="flex items-baseline justify-between gap-2">
                    {pk.precoInicial ? (
                      <>
                        <span className="mono text-xs text-muted uppercase">{t.servicos.aPartir}</span>
                        <span className="gothic chrome-text text-3xl">{pk.precoInicial}</span>
                      </>
                    ) : (
                      <span className="mono text-sm text-silver-hi">{t.servicos.consulta}</span>
                    )}
                  </p>
                  {ex && (
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("lp2-caso", { detail: ex.slug }))} className="needs-js text-left text-sm text-muted underline decoration-white/20 underline-offset-4 hover:text-silver-hi">
                      {t.servicos.exemplo}: {ex.nome}
                    </button>
                  )}
                  <a href="#contato" onClick={() => pedir(pk.id)} className="btn btn-ghost btn-sm w-full">
                    {t.servicos.pedir}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="glass grid gap-6 rounded-[24px] p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8" data-reveal>
          <p className="title text-2xl text-silver">{t.servicos.dif}</p>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIFERENCIAIS[lang].map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-[0.95rem] text-text/85">
                <span aria-hidden="true" className="mt-0.5 text-silver">
                  ✦
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
