/* Política de segurança (CSP) para a exportação estática.
   O GitHub Pages não deixa configurar cabeçalhos, então a CSP vai numa <meta> em cada HTML.
   Os scripts inline do Next (dados da página) mudam a cada build: aqui calculamos o hash de cada um,
   assim nenhum script injetado de fora roda. Sem dependências: roda depois do `next build`.
   Uso: node ferramentas/csp.mjs            (grava)
        node ferramentas/csp.mjs --verificar (só confere; falha se algum HTML estiver sem CSP válida) */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const verificar = process.argv.includes("--verificar");

async function* htmls(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmls(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

const sha = (s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

function politica(hashes) {
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(" ")}`,
    "style-src 'self' 'unsafe-inline'", // estilos inline do React (transform, opacidade)
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

let total = 0;
let erros = 0;
for await (const arquivo of htmls(OUT)) {
  let html = await readFile(arquivo, "utf8");
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/g, "");
  const hashes = new Set();
  // scripts inline executáveis (JSON-LD é dado, não roda, e não precisa de hash)
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/(ld\+)?json"/.test(m[1])) continue;
    hashes.add(sha(m[2]));
  }
  const meta = `<meta http-equiv="Content-Security-Policy" content="${politica([...hashes])}"/>`;
  if (verificar) {
    const atual = (await readFile(arquivo, "utf8")).match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/)?.[1];
    if (atual !== politica([...hashes])) {
      console.error(`CSP ausente ou desatualizada: ${arquivo}`);
      erros++;
    }
  } else {
    // logo depois do charset, antes de qualquer script
    html = html.replace(/(<meta charSet="utf-8"\/>)/i, `$1${meta}`);
    if (!html.includes(meta)) throw new Error(`não achei <meta charset> em ${arquivo}`);
    await writeFile(arquivo, html);
  }
  total++;
}
if (erros) process.exit(1);
console.log(`CSP ${verificar ? "conferida" : "gravada"} em ${total} página(s)`);
