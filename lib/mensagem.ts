import { TEXTOS, type Lang } from "./dados";

export type Briefing = {
  assunto: "vaga" | "projeto" | "outro";
  tipo: "" | "landing" | "site" | "loja" | "sistema";
  prazo: "" | "calma" | "mes" | "urgente";
  orcamento: "" | "1" | "2" | "3" | "0";
  nome: string;
  empresa: string;
  email: string;
  msg: string;
};

export const BRIEFING_VAZIO: Briefing = { assunto: "projeto", tipo: "", prazo: "", orcamento: "", nome: "", empresa: "", email: "", msg: "" };

/** Monta o texto que vai para o WhatsApp ou para o e-mail (quebras de linha preservadas) */
export function montarMensagem(b: Briefing, lang: Lang) {
  const f = TEXTOS[lang].contato.form;
  const m = TEXTOS[lang].contato.msg;
  const linhas = [m.ola(b.nome.trim(), b.empresa.trim()), ""];
  linhas.push(`• ${m.assunto}: ${f.sobreOps[b.assunto]}`);
  if (b.assunto === "projeto") {
    if (b.tipo) linhas.push(`• ${m.tipo}: ${f.tipoOps[b.tipo]}`);
    if (b.prazo) linhas.push(`• ${m.prazo}: ${f.prazoOps[b.prazo]}`);
    if (b.orcamento) linhas.push(`• ${m.orcamento}: ${f.orcamentoOps[b.orcamento]}`);
  }
  if (b.email.trim()) linhas.push(`• ${m.email}: ${b.email.trim()}`);
  if (b.msg.trim()) linhas.push("", b.msg.trim());
  linhas.push("", m.assina);
  return linhas.join("\n");
}

export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
