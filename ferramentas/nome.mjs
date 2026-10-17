/* Contornos de "Carlos Serra" em UnifrakturCook, letra por letra, para a intro "escrever" o nome.
   Gera components/layout/nomePath.ts. Uso: cd ferramentas && node nome.mjs */
import { writeFile } from "node:fs/promises";
import opentype from "opentype.js";

const fonte = opentype.loadSync(new URL("./.cache/UnifrakturCook.ttf", import.meta.url).pathname);
const TEXTO = "Carlos Serra";
const TAM = 100;

// posição de cada letra com o kerning da própria fonte
const glifos = fonte.stringToGlyphs(TEXTO);
let x = 0;
const letras = [];
glifos.forEach((g, i) => {
  if (TEXTO[i] !== " ") {
    const p = g.getPath(x, 0, TAM);
    letras.push({ d: p.toPathData(1), bb: p.getBoundingBox() });
  }
  const prox = glifos[i + 1];
  x += (g.advanceWidth + (prox ? fonte.getKerningValue(g, prox) : 0)) * (TAM / fonte.unitsPerEm);
});

// recorta a caixa ao redor das letras (com folga para o traço)
const minX = Math.min(...letras.map((l) => l.bb.x1)) - 2;
const minY = Math.min(...letras.map((l) => l.bb.y1)) - 2;
const maxX = Math.max(...letras.map((l) => l.bb.x2)) + 2;
const maxY = Math.max(...letras.map((l) => l.bb.y2)) + 2;
const fmt = (n) => Number(n.toFixed(1));

await writeFile(
  new URL("../components/layout/nomePath.ts", import.meta.url),
  `// Gerado por ferramentas/nome.mjs: "${TEXTO}" em UnifrakturCook, uma entrada por letra
export const NOME = {
  viewBox: "${fmt(minX)} ${fmt(minY)} ${fmt(maxX - minX)} ${fmt(maxY - minY)}",
  letras: ${JSON.stringify(letras.map((l) => l.d))},
};
`,
);
console.log(`nome gerado: ${letras.length} letras, ${(letras.reduce((s, l) => s + l.d.length, 0) / 1024).toFixed(1)} KB`);
