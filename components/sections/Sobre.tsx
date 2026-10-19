"use client";

import { ClipboardCopy, Contact, FileText, Mail } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { LinkedinIcon } from "@/components/ui/BrandIcons";
import { toast } from "@/components/ui/Toaster";
import { asset } from "@/lib/asset";
import { baixarVcf, copiar } from "@/lib/acoes";
import { CONFIG, TRAJETORIA, resumoATS } from "@/lib/dados";

export function Sobre() {
  const { t, lang } = useLang();

  const copiarResumo = async () => {
    const ok = await copiar(resumoATS(lang));
    toast(ok ? t.recrutador.copiado : t.recrutador.falhou(CONFIG.email));
  };
  const copiarEmail = async () => {
    const ok = await copiar(CONFIG.email);
    toast(ok ? t.recrutador.emailCopiado(CONFIG.email) : t.recrutador.falhou(CONFIG.email));
  };

  return (
    <section id="sobre" aria-labelledby="sobre-t" className="section">
      <div className="wrap grid gap-16">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <figure className="relative mx-auto w-full max-w-[460px]" data-reveal="clip" data-parallax="0.08">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(80%_70%_at_50%_30%,#12305a,#07060d)]">
              <picture>
                <source type="image/avif" srcSet={`${asset("/foto/retrato-560.avif")} 560w, ${asset("/foto/retrato-1024.avif")} 1024w`} sizes="(max-width: 1024px) 90vw, 460px" />
                <img
                  src={asset("/foto/retrato-560.webp")}
                  srcSet={`${asset("/foto/retrato-560.webp")} 560w, ${asset("/foto/retrato-1024.webp")} 1024w`}
                  sizes="(max-width: 1024px) 90vw, 460px"
                  width={1024}
                  height={1024}
                  alt={t.sobre.retratoAlt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
              </picture>
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(1,3,7,.85))]" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="gothic chrome-text text-4xl">{CONFIG.nome}</span>
                <span className="mono mt-1 block text-[0.68rem] tracking-[0.2em] text-muted uppercase">ADS · FMP · Palhoça, SC</span>
              </figcaption>
            </div>
            <span aria-hidden="true" className="pointer-events-none absolute -inset-3 -z-10 rounded-[34px] border border-silver/15" />
          </figure>

          <div className="grid gap-8">
            <SectionHead id="sobre-t" k={t.sobre.k} t={t.sobre.t} />
            <div className="grid gap-4 text-[1.05rem] text-text/80" data-reveal>
              <p>{t.sobre.p1}</p>
              <p>{t.sobre.p2}</p>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2" data-reveal>
              {t.sobre.ficha.map(([k, v]) => (
                <div key={k} className="bg-space p-4">
                  <dt className="kicker text-[0.66rem] text-muted">{k}</dt>
                  <dd className="mt-1 text-text">{v}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal>
              <h3 className="kicker mb-4">{t.sobre.trajetoria}</h3>
              <ol className="grid gap-0 border-l border-silver/25">
                {TRAJETORIA.map((m) => (
                  <li key={m.titulo.pt} className="relative grid gap-0.5 py-3 pl-6">
                    <span aria-hidden="true" className="absolute -left-[5px] top-[1.15rem] size-[9px] rounded-full border border-silver bg-void" />
                    <p className="mono text-xs text-silver">{m.data[lang]}</p>
                    <p className="font-semibold text-text">{m.titulo[lang]}</p>
                    <p className="text-[0.95rem] text-muted">{m.texto[lang]}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Atalho do recrutador */}
        <div id="recrutador" className="anchor glass glass-chrome relative grid gap-8 overflow-hidden rounded-[28px] p-[clamp(24px,4vw,48px)] lg:grid-cols-[1fr_auto] lg:items-center" data-reveal data-tilt="3">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgba(176,208,255,.16),transparent_70%)]" />
          <div className="relative grid gap-3">
            <p className="kicker">
              <span aria-hidden="true">✦ </span>
              {t.recrutador.k}
            </p>
            <h3 className="title text-[clamp(2rem,4.4vw,3.2rem)] text-text">{t.recrutador.t}</h3>
            <p className="lede">{t.recrutador.p}</p>
          </div>
          <div className="relative flex flex-wrap gap-3 lg:max-w-[520px] lg:justify-end">
            {CONFIG.curriculo && (
              <a href={CONFIG.curriculo} target="_blank" rel="noopener noreferrer" className="btn btn-chrome">
                <FileText size={17} aria-hidden="true" /> {t.recrutador.cv}
              </a>
            )}
            {CONFIG.linkedin && (
              <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <LinkedinIcon size={16} /> {t.recrutador.linkedin}
              </a>
            )}
            <button type="button" onClick={copiarResumo} className={`needs-js btn ${CONFIG.curriculo ? "btn-ghost" : "btn-chrome"}`}>
              <ClipboardCopy size={17} aria-hidden="true" /> {t.recrutador.ats}
            </button>
            <button type="button" onClick={copiarEmail} className="needs-js btn btn-ghost">
              <Mail size={17} aria-hidden="true" /> {t.recrutador.email}
            </button>
            <button
              type="button"
              onClick={() => {
                baixarVcf();
                toast(t.recrutador.vcfOk);
              }}
              className="needs-js btn btn-ghost"
            >
              <Contact size={17} aria-hidden="true" /> {t.recrutador.vcf}
            </button>
            <a href={`mailto:${CONFIG.email}`} className="no-js-only btn btn-ghost">
              <Mail size={17} aria-hidden="true" /> {CONFIG.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
