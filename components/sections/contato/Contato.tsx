"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Copy, Mail, Send } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { SectionHead } from "@/components/ui/SectionHead";
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "@/components/ui/BrandIcons";
import { toast } from "@/components/ui/Toaster";
import { copiar } from "@/lib/acoes";
import { CONFIG, ghLink, waLink } from "@/lib/dados";
import { BRIEFING_VAZIO, emailValido, montarMensagem, type Briefing } from "@/lib/mensagem";
import { useClock } from "@/lib/useClock";
import { cn } from "@/lib/cn";

type Erros = Partial<Record<"nome" | "msg" | "email", string>>;

function Chips<K extends string>({ name, legend, value, ops, onChange }: { name: string; legend: string; value: string; ops: Record<K, string>; onChange: (k: K) => void }) {
  return (
    <fieldset className="grid gap-2.5">
      <legend className="kicker mb-2.5 text-[0.68rem] text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ops) as K[]).map((k) => (
          <label key={k} className="chip-radio">
            <input type="radio" name={name} value={k} checked={value === k} onChange={() => onChange(k)} className="sr-only" />
            <span className="chip">{ops[k]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Contato({ qr }: { qr: React.ReactNode }) {
  const { t, lang } = useLang();
  const f = t.contato.form;
  const hora = useClock();
  const [b, setB] = useState<Briefing>(BRIEFING_VAZIO);
  const [erros, setErros] = useState<Erros>({});
  const form = useRef<HTMLFormElement>(null);
  const uid = useId();
  const set = <K extends keyof Briefing>(k: K, v: Briefing[K]) => {
    setB((x) => ({ ...x, [k]: v }));
    if (k in erros) setErros((e) => ({ ...e, [k]: undefined }));
  };

  // Botões do resto da página já escolhem o assunto ("Quero um site", "Sou recrutador", pacotes)
  useEffect(() => {
    const onBriefing = (e: Event) => {
      const d = (e as CustomEvent<Partial<Briefing>>).detail;
      setB((x) => ({ ...x, ...d }));
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.<HTMLElement>("[data-assunto]");
      const v = a?.dataset.assunto;
      if (v === "vaga" || v === "projeto" || v === "outro") setB((x) => ({ ...x, assunto: v }));
    };
    addEventListener("lp2-briefing", onBriefing);
    document.addEventListener("click", onClick);
    return () => {
      removeEventListener("lp2-briefing", onBriefing);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const texto = montarMensagem(b, lang);

  const validar = (): boolean => {
    const e: Erros = {};
    if (!b.nome.trim()) e.nome = f.erroNome;
    if (b.msg.trim().length < 10) e.msg = f.erroMsg;
    if (b.email.trim() && !emailValido(b.email)) e.email = f.erroEmail;
    setErros(e);
    const primeiro = (["nome", "email", "msg"] as const).find((k) => e[k]);
    if (primeiro) form.current?.querySelector<HTMLElement>(`[name="${primeiro}"]`)?.focus();
    return !primeiro;
  };

  const enviarWa = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;
    window.open(waLink(texto), "_blank", "noopener,noreferrer");
    toast(f.abriuWa);
  };
  const enviarEmail = () => {
    if (!validar()) return;
    const subject = t.contato.msg.subject(b.nome.trim() || "site");
    location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(texto)}`;
    toast(f.abriuEmail);
  };
  const copiarEmail = async () => {
    const ok = await copiar(CONFIG.email);
    toast(ok ? t.recrutador.emailCopiado(CONFIG.email) : t.recrutador.falhou(CONFIG.email));
  };

  const campo = "w-full rounded-xl border border-white/15 bg-void/60 px-4 py-3 text-text placeholder:text-muted/70 transition-colors focus:border-gold focus:outline-none aria-[invalid=true]:border-[#ff8a80]";

  return (
    <section id="contato" aria-labelledby="contato-t" className="section">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_20%_20%,rgba(10,31,61,.9),transparent),radial-gradient(40%_40%_at_90%_80%,rgba(242,193,78,.06),transparent)]" />
      <div className="wrap relative grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div className="grid content-start gap-8">
          <SectionHead id="contato-t" k={t.contato.k} t={t.contato.t} p={t.contato.p} />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text/85" data-reveal>
            <span className="flex items-center gap-2.5">
              <span className="pulse-dot" aria-hidden="true" />
              {t.contato.disponivel}
            </span>
            <span className="mono text-muted">
              {t.contato.agora}: <span className="tabular-nums text-gold-hi">{hora || "--:--"}</span>
            </span>
            {CONFIG.resposta[lang] && <span className="text-muted">{CONFIG.resposta[lang]}</span>}
          </div>

          <ul className="grid gap-3">
            <li data-reveal>
              <a href={waLink(t.contato.msg.padrao)} target="_blank" rel="noopener noreferrer" className="glass glass-gold group flex items-center gap-4 rounded-2xl p-5 no-underline transition-transform duration-500 hover:-translate-y-0.5">
                <span className="grid size-12 flex-none place-items-center rounded-xl bg-[#25d366]/15 text-[#5ee08f]">
                  <WhatsappIcon size={22} />
                </span>
                <span className="grid min-w-0">
                  <span className="font-semibold text-text">
                    WhatsApp · <span className="whitespace-nowrap">{CONFIG.telefone}</span>
                  </span>
                  <span className="text-sm text-muted">{t.contato.chWa}</span>
                </span>
                <ArrowUpRight size={18} className="ms-auto flex-none text-gold transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                <span className="sr-only">({t.geral.abreNovaAba})</span>
              </a>
            </li>
            <li data-reveal style={{ "--d": 1 } as React.CSSProperties} className="glass flex items-center gap-4 rounded-2xl p-5">
              <span className="grid size-12 flex-none place-items-center rounded-xl bg-gold/10 text-gold">
                <Mail size={20} aria-hidden="true" />
              </span>
              <a href={`mailto:${CONFIG.email}`} className="grid min-w-0 no-underline">
                <span className="font-semibold break-all text-text">{CONFIG.email}</span>
                <span className="text-sm text-muted">{t.contato.chEmail}</span>
              </a>
              <button type="button" onClick={copiarEmail} className="needs-js ms-auto grid size-11 flex-none place-items-center rounded-full border border-line hover:border-gold" aria-label={`${t.contato.copiar}: ${CONFIG.email}`}>
                <Copy size={16} aria-hidden="true" />
              </button>
            </li>
            <li data-reveal style={{ "--d": 2 } as React.CSSProperties} className="grid gap-3 sm:grid-cols-2">
              <a href={ghLink()} target="_blank" rel="noopener noreferrer" className="glass flex items-center gap-3 rounded-2xl p-4 no-underline hover:border-gold/40">
                <GithubIcon size={20} />
                <span className="grid">
                  <span className="font-semibold text-text">GitHub</span>
                  <span className="text-xs text-muted">{t.contato.chGh}</span>
                </span>
                <span className="sr-only">({t.geral.abreNovaAba})</span>
              </a>
              {CONFIG.linkedin && (
                <a href={CONFIG.linkedin} target="_blank" rel="noopener noreferrer" className="glass flex items-center gap-3 rounded-2xl p-4 no-underline hover:border-gold/40">
                  <LinkedinIcon size={20} />
                  <span className="grid">
                    <span className="font-semibold text-text">LinkedIn</span>
                    <span className="text-xs text-muted">{t.contato.chIn}</span>
                  </span>
                  <span className="sr-only">({t.geral.abreNovaAba})</span>
                </a>
              )}
            </li>
            <li data-reveal style={{ "--d": 3 } as React.CSSProperties} className="glass hidden items-center gap-5 rounded-2xl p-5 lg:flex">
              <div className="rounded-xl border border-line bg-void p-3">{qr}</div>
              <div>
                <p className="font-semibold text-text">{t.contato.qrT}</p>
                <p className="text-sm text-muted">{t.contato.qrP}</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Briefing: vira mensagem pronta no WhatsApp ou no e-mail */}
        <div data-reveal style={{ "--d": 2 } as React.CSSProperties}>
          <form ref={form} onSubmit={enviarWa} noValidate className="needs-js glass glass-gold grid gap-6 rounded-[28px] p-[clamp(20px,3.5vw,40px)]" aria-labelledby={`${uid}-t`}>
            <div className="flex items-center justify-between gap-4">
              <h3 id={`${uid}-t`} className="title text-[clamp(1.8rem,3vw,2.4rem)] text-text">
                {f.t}
              </h3>
              <Send size={20} className="text-gold" aria-hidden="true" />
            </div>

            <Chips name="assunto" legend={f.sobre} value={b.assunto} ops={f.sobreOps} onChange={(v) => set("assunto", v)} />
            {b.assunto === "projeto" && (
              <div className="grid gap-6">
                <Chips name="tipo" legend={f.tipo} value={b.tipo} ops={f.tipoOps} onChange={(v) => set("tipo", v)} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Chips name="prazo" legend={f.prazo} value={b.prazo} ops={f.prazoOps} onChange={(v) => set("prazo", v)} />
                  <Chips name="orcamento" legend={f.orcamento} value={b.orcamento} ops={f.orcamentoOps} onChange={(v) => set("orcamento", v)} />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor={`${uid}-nome`} className="text-sm text-text/85">
                  {f.nome}
                </label>
                <input id={`${uid}-nome`} name="nome" autoComplete="name" value={b.nome} onChange={(e) => set("nome", e.target.value)} className={campo} aria-invalid={!!erros.nome} aria-describedby={erros.nome ? `${uid}-e-nome` : undefined} required />
                {erros.nome && (
                  <p id={`${uid}-e-nome`} className="text-sm text-[#ffb4ab]">
                    {erros.nome}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`${uid}-empresa`} className="text-sm text-text/85">
                  {f.empresa}
                </label>
                <input id={`${uid}-empresa`} name="empresa" autoComplete="organization" value={b.empresa} onChange={(e) => set("empresa", e.target.value)} className={campo} />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <label htmlFor={`${uid}-email`} className="text-sm text-text/85">
                  {f.email}
                </label>
                <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" value={b.email} onChange={(e) => set("email", e.target.value)} className={campo} aria-invalid={!!erros.email} aria-describedby={erros.email ? `${uid}-e-email` : undefined} />
                {erros.email && (
                  <p id={`${uid}-e-email`} className="text-sm text-[#ffb4ab]">
                    {erros.email}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <label htmlFor={`${uid}-msg`} className="text-sm text-text/85">
                  {f.msg}
                </label>
                <textarea id={`${uid}-msg`} name="msg" rows={4} value={b.msg} onChange={(e) => set("msg", e.target.value)} className={cn(campo, "resize-y")} aria-invalid={!!erros.msg} aria-describedby={`${uid}-dica${erros.msg ? ` ${uid}-e-msg` : ""}`} required minLength={10} />
                <p id={`${uid}-dica`} className="text-xs text-muted">
                  {f.msgDica}
                </p>
                {erros.msg && (
                  <p id={`${uid}-e-msg`} className="text-sm text-[#ffb4ab]">
                    {erros.msg}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <p className="kicker text-[0.68rem] text-muted" id={`${uid}-prev`}>
                {f.previa}
              </p>
              <div className="relative rounded-2xl rounded-tl-sm border border-[#25d366]/20 bg-[#0b1f17]/70 p-4 text-[0.92rem] whitespace-pre-wrap text-text/90" aria-labelledby={`${uid}-prev`} role="note">
                {texto}
                <span className="mono mt-2 block text-right text-[0.65rem] text-muted">{hora}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn btn-gold min-h-13 flex-1">
                <WhatsappIcon size={18} /> {f.enviarWa}
              </button>
              <button type="button" onClick={enviarEmail} className="btn btn-ghost min-h-13 flex-1">
                <Mail size={18} aria-hidden="true" /> {f.enviarEmail}
              </button>
            </div>
          </form>

          {/* sem JavaScript o formulário vira um link direto */}
          <a href={waLink(t.contato.msg.padrao)} className="no-js-only btn btn-gold w-full min-h-14 text-base">
            <WhatsappIcon size={20} /> {f.semJs}
          </a>
        </div>
      </div>
    </section>
  );
}
