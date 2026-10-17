/* Baixa as fontes em TTF (o opentype.js não lê woff2) para gerar contornos e imagens */
import { mkdir, writeFile } from "node:fs/promises";

const UA = "Mozilla/5.0 (Linux; U; Android 2.2; en-us) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";
const FONTES = { UnifrakturCook: "UnifrakturCook:wght@700", UnifrakturMaguntia: "UnifrakturMaguntia", GrenzeGotisch: "Grenze+Gotisch:wght@700", Inter: "Inter:wght@500" };
await mkdir(new URL("./.cache/", import.meta.url), { recursive: true });
for (const [nome, familia] of Object.entries(FONTES)) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${familia}`, { headers: { "User-Agent": UA } })).text();
  const url = css.match(/https:\/\/[^)]+/)?.[0];
  if (!url) throw new Error(`fonte não encontrada: ${nome}`);
  await writeFile(new URL(`./.cache/${nome}.ttf`, import.meta.url), Buffer.from(await (await fetch(url)).arrayBuffer()));
  console.log("baixada:", nome);
}
