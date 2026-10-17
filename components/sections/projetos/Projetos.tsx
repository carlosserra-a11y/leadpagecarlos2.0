"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { PROJETOS, type Repo } from "@/lib/dados";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { ProjectCard } from "./ProjectCard";
import { CaseModal } from "./CaseModal";
import { Arquivo } from "./Arquivo";
import { Galaxia } from "./Galaxia";

/* Galáxia de Projetos: no computador com GPU, órbita 3D fixada na tela;
   no celular (ou sem 3D), carrossel de arrastar com o mesmo conteúdo. */
export function Projetos({ novos }: { novos: Repo[] }) {
  const { t } = useLang();
  const tier = useDeviceTier();
  const [caso, setCaso] = useState<number | null>(null);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const up = () => setDesktop(mq.matches);
    up();
    mq.addEventListener("change", up);
    return () => mq.removeEventListener("change", up);
  }, []);

  // Link direto para um estudo de caso: #caso-figaros
  useEffect(() => {
    const abrirDoHash = () => {
      const m = location.hash.match(/^#caso-(.+)$/);
      if (!m) return;
      const i = PROJETOS.findIndex((p) => p.slug === m[1]);
      if (i >= 0) setCaso(i);
    };
    abrirDoHash();
    addEventListener("hashchange", abrirDoHash);
    return () => removeEventListener("hashchange", abrirDoHash);
  }, []);

  const abrir = useCallback((i: number) => setCaso(i), []);
  const fechar = useCallback(() => setCaso(null), []);

  const galaxia3d = desktop && (tier === "high" || tier === "mid");

  return (
    <section id="projetos" aria-labelledby="projetos-t" className="section relative !pb-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[70svh] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(10,31,61,.9),transparent)]" />
      <div className="wrap relative">
        <SectionHead id="projetos-t" k={t.projetos.k} t={t.projetos.t} p={t.projetos.p} />
      </div>

      {galaxia3d ? (
        <Galaxia onOpen={abrir} tier={tier} />
      ) : (
        <div className="relative mt-12">
          <div className="carousel wrap-carousel lg:mx-auto lg:max-w-[1240px]" data-grid="true" data-lenis-prevent-touch>
            {PROJETOS.map((p, i) => (
              <ProjectCard key={p.slug} p={p} i={i} onOpen={abrir} />
            ))}
          </div>
          <p className="mono mt-1 text-center text-[0.68rem] tracking-[0.2em] text-muted uppercase lg:hidden" aria-hidden="true">
            ← {t.projetos.arraste} →
          </p>
        </div>
      )}

      <Arquivo novos={novos} />
      <CaseModal index={caso} onChange={setCaso} onClose={fechar} />
    </section>
  );
}
