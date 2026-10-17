"use client";

import { CONFIG } from "./dados";

/** Copia texto; se o navegador bloquear, cai para o método antigo */
export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Gera o cartão de contato (.vcf) e baixa */
export function baixarVcf() {
  const linhas = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Serra;Carlos;;;",
    "FN:Carlos Serra",
    "TITLE:Desenvolvedor Full Stack Júnior",
    `EMAIL;TYPE=INTERNET:${CONFIG.email}`,
    `TEL;TYPE=CELL:+${CONFIG.whatsapp}`,
    "ADR;TYPE=HOME:;;;Palhoça;SC;;Brasil",
    `URL:${CONFIG.siteUrl}`,
    `URL:https://github.com/${CONFIG.github}`,
    CONFIG.linkedin ? `URL:${CONFIG.linkedin}` : "",
    "END:VCARD",
  ].filter(Boolean);
  const blob = new Blob([linhas.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "carlos-serra.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
