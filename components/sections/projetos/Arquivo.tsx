"use client";

import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { CONFIG, REPOS, type Repo, type Lang, ghLink, pagesLink } from "@/lib/dados";
import { cn } from "@/lib/cn";

const FILTROS = {
  all: () => true,
  clientes: (r: Repo) => r.c === "negocio" || r.c === "sistema",
  "3d": (r: Repo) => /\b(three|3d|webgl|shader)\b/.test(r.tags),
  ia: (r: Repo) => /\b(ia|ai|gemini)\b/.test(r.tags),
  react: (r: Repo) => /\b(react|typescript)\b/.test(r.tags) || r.l === "TypeScript",
  back: (r: Repo) => /\b(node|express|sqlite)\b/.test(r.tags),
  estudos: (r: Repo) => r.c === "fmp" || r.c === "inicio",
} as const;
type Filtro = keyof typeof FILTROS;

const MESES: Record<Lang, string[]> = {
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const data = (iso: string, lang: Lang) => {
  const [y, m, d] = iso.split("-").map(Number);
  return lang === "pt" ? `${d} ${MESES.pt[m - 1]} ${y}` : `${MESES.en[m - 1]} ${d}, ${y}`;
};

const LIMITE = 8;

export function Arquivo({ novos }: { novos: Repo[] }) {
  const { t, lang } = useLang();
  const [filtro, setFiltro] = useState<Filtro>("all");
  const [todos, setTodos] = useState(false);
  const lista = useMemo(() => [...novos, ...REPOS], [novos]);
  const linhas = lista.filter(FILTROS[filtro]);
  const listaRef = useRef<HTMLOListElement>(null);

  return (
    <div id="arquivo" className="anchor wrap mt-[clamp(72px,10vw,140px)] grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="grid gap-3">
          <h3 className="title text-[clamp(2rem,4.4vw,3.2rem)] text-text" data-reveal>
            {t.arquivo.t} <span className="mono align-middle text-base text-muted">({lista.length})</span>
          </h3>
          <p className="lede" data-reveal>
            {t.arquivo.p}
          </p>
        </div>
        <div role="group" aria-label={t.arquivo.filtros} className="needs-js flex flex-wrap gap-2">
          {(Object.keys(FILTROS) as Filtro[]).map((k) => {
            const n = lista.filter(FILTROS[k]).length;
            if (!n && k !== "all") return null;
            return (
              <button key={k} type="button" className="chip" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>
                {t.arquivo.filters[k]} <span className="n">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* o leitor de tela ouve só a contagem quando o filtro muda (não a lista inteira) */}
      <p className="sr-only" aria-live="polite">
        {t.arquivo.filters[filtro]}: {linhas.length}
      </p>
      {/* todas as linhas vão no HTML (sem JS aparece tudo); com JS o CSS recolhe depois da 8ª */}
      <ol ref={listaRef} className="arquivo-lista border-t border-line" data-recolhida={!todos}>
        {linhas.length === 0 && <li className="py-8 text-muted">{t.arquivo.vazio}</li>}
        {linhas.map((r) => {
          const titulo = lang === "en" && r.te ? r.te : r.t;
          return (
          <li key={r.n} className="group grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 border-b border-line py-5 transition-colors hover:bg-white/[0.02] md:grid-cols-[110px_1fr_110px_auto]">
            <time className="mono order-3 text-xs text-muted md:order-none md:pt-1.5" dateTime={r.at}>
              {data(r.at, lang)}
            </time>
            <div className="col-span-2 min-w-0 md:col-span-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-text">
                {titulo}
                {r.novo && <span className="tag !text-[0.65rem]">{t.arquivo.novo}</span>}
              </p>
              <p className="mt-1 text-[0.95rem] text-muted">{(lang === "en" ? r.de : r.d) || t.arquivo.novoDesc}</p>
            </div>
            <span className="mono order-4 text-xs tracking-widest text-gold/80 uppercase md:order-none md:pt-1.5">{t.arquivo.kinds[r.c]}</span>
            <div className="order-5 flex items-center gap-1 md:order-none">
              {r.pages && (
                <a href={pagesLink(r.n)} target="_blank" rel="noopener noreferrer" className={cn("grid size-11 place-items-center rounded-full border border-line text-text/80 hover:border-gold hover:text-gold-hi")}>
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only">
                    {t.arquivo.site}: {titulo} ({t.geral.abreNovaAba})
                  </span>
                </a>
              )}
              <a href={ghLink(r.n)} target="_blank" rel="noopener noreferrer" className="grid size-11 place-items-center rounded-full border border-line text-text/80 hover:border-gold hover:text-gold-hi">
                <GithubIcon size={15} />
                <span className="sr-only">
                  {t.arquivo.codigo}: {titulo} ({t.geral.abreNovaAba})
                </span>
              </a>
            </div>
          </li>
          );
        })}
      </ol>

      {linhas.length > LIMITE && (
        <button
          type="button"
          className="needs-js btn btn-ghost justify-self-center"
          aria-expanded={todos}
          onClick={(e) => {
            if (!todos) return setTodos(true);
            // recolhe primeiro e depois compensa a rolagem: o botão fica no mesmo lugar da tela (e com o foco)
            const btn = e.currentTarget;
            const antes = btn.getBoundingClientRect().top;
            flushSync(() => setTodos(false));
            const depois = btn.getBoundingClientRect().top;
            scrollToTarget(Math.max(0, scrollY + depois - antes), true);
          }}
        >
          {todos ? t.arquivo.menos : t.arquivo.mais(linhas.length)}
        </button>
      )}
      <a href={`${ghLink()}?tab=repositories`} target="_blank" rel="noopener noreferrer" className="link-arrow justify-self-center text-sm">
        <GithubIcon size={14} /> github.com/{CONFIG.github} <ArrowUpRight size={15} aria-hidden="true" />
        <span className="sr-only">({t.geral.abreNovaAba})</span>
      </a>
    </div>
  );
}
