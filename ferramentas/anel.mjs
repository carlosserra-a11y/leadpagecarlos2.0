/* Anel do alfabeto gótico (primeira referência do Carlos) em contornos, para o hero e a intro.
   Em contorno (path, usado por <use>) ele não depende de fonte, não pesa no HTML
   e não conta como "maior elemento" da página (LCP). Gera public/hero/anel.svg.
   Uso: cd ferramentas && node anel.mjs */
import { writeFile } from "node:fs/promises";
import opentype from "opentype.js";

const fonte = opentype.loadSync(new URL("./.cache/UnifrakturMaguntia.ttf", import.meta.url).pathname);
const C = 280; // centro do viewBox 560×560
const R = 245; // raio da linha de base
const TAM = 27; // tamanho da letra
const LETRAS = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "✦", ..."abcdefghijklm"];

const fmt = (n) => Number(n.toFixed(1));
let d = "";
LETRAS.forEach((ch, i) => {
  // começa na esquerda (180°) e anda no sentido horário, como o textPath fazia
  const ang = Math.PI + (i / LETRAS.length) * Math.PI * 2;
  const px = C + Math.cos(ang) * R;
  const py = C + Math.sin(ang) * R;
  const rot = ang + Math.PI / 2; // letra em pé, olhando para fora
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  let cmds;
  if (ch === "✦") {
    // estrela de quatro pontas desenhada à mão (a fonte não tem esse símbolo)
    const s = 9;
    cmds = [
      { type: "M", x: 0, y: -s * 2 }, { type: "Q", x1: 1.2, y1: -s - 1.2, x: s, y: -s },
      { type: "Q", x1: 1.2, y1: -s + 1.2, x: 0, y: 0 }, { type: "Q", x1: -1.2, y1: -s + 1.2, x: -s, y: -s },
      { type: "Q", x1: -1.2, y1: -s - 1.2, x: 0, y: -s * 2 }, { type: "Z" },
    ];
  } else {
    const g = fonte.charToGlyph(ch);
    const larg = (g.advanceWidth / fonte.unitsPerEm) * TAM;
    cmds = g.getPath(-larg / 2, 0, TAM).commands; // centrado no ponto do círculo
  }
  const t = (x, y) => [fmt(px + x * cos - y * sin), fmt(py + x * sin + y * cos)];
  for (const c of cmds) {
    if (c.type === "Z") d += "Z";
    else if (c.type === "M" || c.type === "L") d += `${c.type}${t(c.x, c.y).join(" ")}`;
    else if (c.type === "Q") d += `Q${[...t(c.x1, c.y1), ...t(c.x, c.y)].join(" ")}`;
    else if (c.type === "C") d += `C${[...t(c.x1, c.y1), ...t(c.x2, c.y2), ...t(c.x, c.y)].join(" ")}`;
  }
});

await writeFile(
  new URL("../public/hero/anel.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560"><!-- alfabeto em UnifrakturMaguntia, raio ${R}; gerado por ferramentas/anel.mjs --><path id="anel" d="${d}"/></svg>\n`,
);
console.log(`anel gerado: ${LETRAS.length} letras, ${(d.length / 1024).toFixed(1)} KB`);
