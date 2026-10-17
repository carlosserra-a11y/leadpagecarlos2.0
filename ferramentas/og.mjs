/* Imagem de compartilhamento (og.jpg para WhatsApp, LinkedIn, X): 1200×630, nome em gótica sobre o buraco negro.
   Uso: cd ferramentas && node og.mjs   (precisa do pôster em public/hero e das fontes em .cache) */
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const b64 = async (rel) => (await readFile(new URL(rel, import.meta.url))).toString("base64");
const poster = await b64("../public/hero/poster.webp");
const cook = await b64("./.cache/UnifrakturCook.ttf");
const grenze = await b64("./.cache/GrenzeGotisch.ttf");
const inter = await b64("./.cache/Inter.ttf");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Cook;src:url(data:font/ttf;base64,${cook})}
@font-face{font-family:Grenze;src:url(data:font/ttf;base64,${grenze})}
@font-face{font-family:Inter;src:url(data:font/ttf;base64,${inter})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#010307;font-family:Inter;color:#eef1f6}
.bg{position:absolute;inset:0;background:url(data:image/webp;base64,${poster}) 50% 22%/cover}
.v{position:absolute;inset:0;background:radial-gradient(90% 80% at 50% 30%,transparent 35%,rgba(1,3,7,.85)),linear-gradient(180deg,transparent 40%,rgba(1,3,7,.92) 78%)}
.c{position:absolute;inset:auto 0 56px;display:grid;justify-items:center;gap:14px;text-align:center}
.b{font:500 19px/1 Inter;letter-spacing:.02em;padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);display:flex;gap:10px;align-items:center}
.b i{width:9px;height:9px;border-radius:50%;background:#4ade80;display:block}
h1{font:700 128px/0.95 Cook;background:linear-gradient(180deg,#fff8e1 6%,#ffe29a 26%,#f0b548 46%,#9a5a17 53%,#e6a33c 60%,#ffe5a3 78%,#c17b22 100%);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 8px 40px rgba(242,193,78,.35))}
.t{font:700 38px/1 Grenze}
.r{font:500 17px/1 Inter;letter-spacing:.28em;text-transform:uppercase;color:#fff1c1;opacity:.85}
.u{position:absolute;right:28px;top:24px;font:500 16px/1 Inter;letter-spacing:.12em;color:rgba(245,241,232,.6)}
</style></head><body><div class="bg"></div><div class="v"></div>
<p class="u">carlosserra-a11y.github.io/leadpagecarlos2.0</p>
<div class="c"><p class="b"><i></i>Disponível para estágio, vaga júnior e novos projetos</p>
<h1>Carlos Serra</h1><p class="r">Desenvolvedor Full Stack Júnior · Palhoça, SC</p><p class="t">A gravidade inevitável do seu negócio</p></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot();
// JPEG abaixo de 300 KB: o WhatsApp só mostra a prévia de imagens leves
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(new URL("../public/og.jpg", import.meta.url).pathname);
await browser.close();
console.log("og.jpg gerado");
