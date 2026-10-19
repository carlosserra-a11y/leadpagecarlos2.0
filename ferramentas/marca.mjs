/* Gera a marca: monograma "CS" em UnifrakturCook dentro do horizonte de eventos.
   As letras viram contornos (path), então o SVG funciona sem a fonte instalada.
   Uso: cd ferramentas && npm install && node marca.mjs
   Requer as fontes em .cache/ (baixadas por baixar-fontes.mjs). */
import { mkdir, writeFile } from "node:fs/promises";
import opentype from "opentype.js";
import sharp from "sharp";

const OUT = new URL("../public/marca/", import.meta.url);
await mkdir(OUT, { recursive: true });

const cook = opentype.loadSync(new URL("./.cache/UnifrakturCook.ttf", import.meta.url).pathname);

/** Contorno do texto centralizado em (cx, cy), com a largura pedida */
function letras(texto, cx, cy, largura) {
  const base = cook.getPath(texto, 0, 0, 100);
  const bb = base.getBoundingBox();
  const k = largura / (bb.x2 - bb.x1);
  const p = cook.getPath(texto, 0, 0, 100 * k);
  const b = p.getBoundingBox();
  const dx = cx - (b.x1 + b.x2) / 2;
  const dy = cy - (b.y1 + b.y2) / 2;
  const p2 = cook.getPath(texto, dx, dy, 100 * k);
  return p2.toPathData(2);
}

const defs = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".1" stop-color="#ffffff"/><stop offset=".55" stop-color="#c9d6e8"/><stop offset="1" stop-color="#7c889b"/>
    </linearGradient>
    <radialGradient id="v" cx=".5" cy=".5" r=".5">
      <stop offset=".6" stop-color="#02030a"/><stop offset="1" stop-color="#101a3c"/>
    </radialGradient>
  </defs>`;

// Logo completo (cabeçalho, og, documentos)
const logo = (fundo = true) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${defs}
  ${fundo ? `<circle cx="32" cy="32" r="31" fill="url(#v)"/>` : ""}
  <circle cx="32" cy="32" r="29.5" fill="none" stroke="url(#g)" stroke-width="1.4" opacity=".9"/>
  <path d="M5.5 38.5c9 7.5 45 6.5 53-9.5" fill="none" stroke="#dbe6f7" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>
  <path d="${letras("CS", 32, 31.5, 36)}" fill="url(#g)"/>
</svg>`;

// Favicon: traço mais grosso para ler em 16–32 px
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${defs}
  <circle cx="32" cy="32" r="31" fill="#02030a"/>
  <circle cx="32" cy="32" r="28.5" fill="none" stroke="url(#g)" stroke-width="3"/>
  <path d="${letras("CS", 32, 32, 42)}" fill="url(#g)"/>
</svg>`;

// Ícone quadrado (celular): fundo cheio, sem transparência
const quadrado = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${defs}
  <rect width="64" height="64" fill="#02030a"/>
  <circle cx="32" cy="32" r="24" fill="url(#v)"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="url(#g)" stroke-width="1.2"/>
  <path d="M10 37c7 6 37 5.5 44-8" fill="none" stroke="#dbe6f7" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>
  <path d="${letras("CS", 32, 31.5, 29)}" fill="url(#g)"/>
</svg>`;

await writeFile(new URL("logo.svg", OUT), logo());
await writeFile(new URL("favicon.svg", OUT), favicon);
const png = (svg, size, nome) => sharp(Buffer.from(svg), { density: 72 * (size / 64) }).resize(size, size).png({ compressionLevel: 9 }).toFile(new URL(nome, OUT).pathname);
await png(favicon, 32, "favicon-32.png");
await png(quadrado, 180, "apple-touch-icon.png");
await png(quadrado, 192, "icon-192.png");
await png(quadrado, 512, "icon-512.png");
await png(logo(), 256, "logo-256.png");
// o mesmo contorno vai para o componente <Logo /> do site (SVG inline, sem pedir arquivo)
await writeFile(
  new URL("../components/ui/logoPath.ts", import.meta.url),
  `// Gerado por ferramentas/marca.mjs: "CS" em UnifrakturCook, viewBox 0 0 64 64\nexport const LOGO_CS = "${letras("CS", 32, 31.5, 36)}";\n`,
);
console.log("marca gerada em public/marca/ e components/ui/logoPath.ts");
