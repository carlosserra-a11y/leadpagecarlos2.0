/* Gera o pôster do hero a partir da própria cena 3D (fallback sem WebGL, "reduzir movimento" e celular fraco).
   Uso: com o site servido localmente (npm run build && npm run servir), rode:
   cd ferramentas && node poster.mjs [url]   (padrão: http://127.0.0.1:4173/leadpagecarlos2.0/) */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const URL_SITE = process.argv[2] || "http://127.0.0.1:4173/leadpagecarlos2.0/";
const OUT = new URL("../public/hero/", import.meta.url);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

async function capturar(nome, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.addInitScript(() => sessionStorage.setItem("lp2-intro", "1")); // sem tela de carregamento
  await page.goto(`${URL_SITE}?tier=high`, { waitUntil: "load" });
  // o 3D só começa depois da primeira interação (e depois da hidratação): mexe o mouse até ligar
  for (let i = 0; i < 120 && !(await page.$('.hero-canvas[data-pronto="true"]')); i++) {
    await page.mouse.move(width / 2 + (i % 2), height / 2);
    await page.waitForTimeout(500);
  }
  await page.waitForSelector('.hero-canvas[data-pronto="true"]', { timeout: 5000 });
  // só a cena: esconde texto, HUD, anel (ele é HTML por cima do pôster) e cabeçalho
  await page.addStyleTag({ content: ".hero-ui,.hud,.gothic-ring,.site-header,.hero-vignette,.cursor{visibility:hidden!important}.hero-canvas{opacity:1!important;transition:none!important}" });
  await page.waitForTimeout(4000);
  const png = await page.locator(".hero-stage").screenshot();
  await sharp(png).webp({ quality: 74, effort: 6 }).toFile(new URL(`${nome}.webp`, OUT).pathname);
  await sharp(png).avif({ quality: 52, effort: 6 }).toFile(new URL(`${nome}.avif`, OUT).pathname);
  await page.close();
  console.log("pôster:", nome);
}

await capturar("poster", 1600, 1000);
await capturar("poster-mob", 760, 1240);
await browser.close();
