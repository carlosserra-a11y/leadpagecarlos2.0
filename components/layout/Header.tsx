"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { getLenis } from "@/components/providers/SmoothScroll";
import { Logo } from "@/components/ui/Logo";
import { WhatsappIcon } from "@/components/ui/BrandIcons";
import { CONFIG, waLink } from "@/lib/dados";
import { cn } from "@/lib/cn";

const SECOES = ["projetos", "servicos", "sobre", "contato"] as const;

export function Header() {
  const { t, toggle, lang } = useLang();
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);
  const [ativo, setAtivo] = useState<string>("");
  const [aberto, setAberto] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  // Fica sólido depois do topo e se esconde ao descer (volta ao subir)
  useEffect(() => {
    let last = scrollY;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = scrollY;
        setSolid(y > 40);
        // só muda com um movimento claro: os últimos quadros da rolagem suave (de 1 ou 2 px) não reabrem o cabeçalho
        if (y > innerHeight * 0.9 && y > last + 4) setHide(true);
        else if (y < last - 4 || y <= innerHeight * 0.9) setHide(false);
        if (Math.abs(y - last) > 4 || y <= innerHeight * 0.9) last = y;
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => {
      removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Marca no menu a seção que está na tela (e desmarca fora delas: hero, processo, stack)
  useEffect(() => {
    const els = SECOES.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const vis = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) vis.set(e.target.id, e.isIntersecting);
        setAtivo(SECOES.find((id) => vis.get(id)) ?? "");
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Menu do celular: fecha sozinho se a tela crescer (giro do tablet, janela maior), porque some no desktop
  useEffect(() => {
    if (!aberto) return;
    const mq = matchMedia("(min-width: 768px)");
    const fecha = () => mq.matches && setAberto(false);
    mq.addEventListener("change", fecha);
    return () => mq.removeEventListener("change", fecha);
  }, [aberto]);

  // Menu do celular: trava a rolagem, Esc fecha e o foco volta ao botão
  useEffect(() => {
    if (!aberto) return;
    getLenis()?.stop();
    const first = painel.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
      if (e.key === "Tab" && painel.current) {
        const f = [...painel.current.querySelectorAll<HTMLElement>("a,button")];
        const a = f[0];
        const b = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault();
          b.focus();
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault();
          a.focus();
        }
      }
    };
    addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    const btn = menuBtn.current;
    return () => {
      removeEventListener("keydown", key);
      document.body.style.overflow = "";
      getLenis()?.start();
      btn?.focus();
    };
  }, [aberto]);

  const links = SECOES.map((id) => ({ id, label: t.nav[id] }));

  return (
    <header className="site-header" data-solid={solid || aberto} data-hide={hide && !aberto}>
      <div className="wrap flex h-full items-center justify-between gap-4">
        <a href="#topo" className="flex min-h-11 items-center gap-3 no-underline" aria-label={t.nav.home}>
          <Logo size={38} />
          <span className="gothic hidden text-[1.55rem] text-text sm:inline">{CONFIG.nome}</span>
        </a>

        <nav aria-label={t.nav.label} className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="nav-link" aria-current={ativo === l.id ? "true" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="needs-js nav-link min-w-11 justify-center rounded-full border border-line px-3"
            lang={lang === "pt" ? "en" : "pt-BR"}
          >
            {t.lang.btn}
            <span className="sr-only"> · {t.lang.label}</span>
          </button>
          <a href={waLink(t.contato.msg.padrao)} target="_blank" rel="noopener noreferrer" className="btn btn-chrome btn-sm hidden sm:inline-flex">
            <WhatsappIcon size={16} />
            {t.cta.waShort}
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="needs-js grid size-11 place-items-center rounded-full border border-line md:hidden"
            aria-expanded={aberto}
            aria-controls="menu-celular"
            aria-label={aberto ? t.nav.fechar : t.nav.menu}
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="menu-celular"
        ref={painel}
        hidden={!aberto}
        className="fixed inset-x-0 top-[var(--header-h)] h-[calc(100svh-var(--header-h))] bg-void/95 backdrop-blur-xl md:hidden"
      >
        <nav aria-label={t.nav.label} className="wrap grid gap-2 pt-8">
          {links.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setAberto(false)}
              className={cn("title flex min-h-14 items-baseline gap-4 border-b border-line py-3 text-4xl text-text no-underline")}
            >
              <span className="mono text-xs text-silver">0{i + 1}</span>
              {l.label}
            </a>
          ))}
          <a href={waLink(t.contato.msg.padrao)} target="_blank" rel="noopener noreferrer" className="btn btn-chrome mt-8">
            <WhatsappIcon size={18} />
            {t.cta.wa}
          </a>
        </nav>
      </div>
    </header>
  );
}
