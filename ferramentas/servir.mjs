/* Servidor estático mínimo para testar a pasta out/ no mesmo caminho do GitHub Pages
   (http://127.0.0.1:4173/leadpagecarlos2.0/). Sem dependências. */
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const BASE = "/leadpagecarlos2.0";
const PORTA = Number(process.env.PORT || 4173);
const TIPOS = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".woff2": "font/woff2", ".xml": "application/xml", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon",
};

createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://x");
  if (!url.pathname.startsWith(BASE)) {
    // como no GitHub Pages: fora da pasta do projeto não há nada (nem robots.txt)
    if (url.pathname !== "/") return res.writeHead(404).end();
    res.writeHead(302, { Location: `${BASE}/` });
    return res.end();
  }
  let caminho = normalize(decodeURIComponent(url.pathname.slice(BASE.length)) || "/");
  if (caminho.includes("..")) return res.writeHead(400).end();
  let arquivo = join(OUT, caminho);
  try {
    if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, "index.html");
    let corpo = await readFile(arquivo);
    const tipo = TIPOS[extname(arquivo)] || "application/octet-stream";
    const cab = { "Content-Type": tipo, "Cache-Control": "max-age=600" };
    // o GitHub Pages comprime texto com gzip: aqui também, para as medições baterem
    if (/text|javascript|json|svg|xml/.test(tipo) && /gzip/.test(req.headers["accept-encoding"] || "")) {
      corpo = gzipSync(corpo);
      cab["Content-Encoding"] = "gzip";
    }
    res.writeHead(200, cab);
    res.end(corpo);
  } catch {
    res.writeHead(404, { "Content-Type": TIPOS[".html"] });
    res.end(await readFile(join(OUT, "404.html")).catch(() => "404"));
  }
}).listen(PORTA, "127.0.0.1", () => console.log(`servindo out/ em http://127.0.0.1:${PORTA}${BASE}/`));
