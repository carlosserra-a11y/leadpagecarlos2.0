import { expect, test, type Page } from "@playwright/test";

/* Avisos de bibliotecas que não são do site */
const IGNORAR = [/THREE\.Clock/];

function coletarErros(page: Page) {
  const erros: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORAR.some((r) => r.test(m.text()))) erros.push(m.text());
  });
  page.on("pageerror", (e) => erros.push(e.message));
  return erros;
}

const semIntro = (page: Page) => page.addInitScript(() => sessionStorage.setItem("lp2-intro", "1"));

test("carrega sem erros, com CSP, um h1 e sem rolagem lateral", async ({ page }) => {
  const erros = coletarErros(page);
  await semIntro(page);
  await page.goto("./");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Carlos Serra");
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
  await page.mouse.move(300, 300); // o 3D começa na primeira interação
  await page.waitForTimeout(4000); // dá tempo para o 3D montar e desenhar
  const lateral = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(lateral).toBeLessThanOrEqual(0);
  expect(erros).toEqual([]);
});

test("CTAs levam aos lugares certos", async ({ page }) => {
  await semIntro(page);
  await page.goto("./");
  const hero = page.locator("#topo");
  await expect(hero.getByRole("link", { name: "Quero um site" })).toHaveAttribute("href", "#contato");
  await expect(hero.getByRole("link", { name: "Ver projetos" })).toHaveAttribute("href", "#projetos");
  await expect(hero.getByRole("link", { name: /Sou recrutador/ })).toHaveAttribute("href", "#recrutador");
  const wa = page.locator('a[href^="https://wa.me/5548996170281"]');
  expect(await wa.count()).toBeGreaterThan(2);
  for (const a of await page.locator('a[target="_blank"]').all()) {
    await expect(a).toHaveAttribute("rel", /noopener/);
  }
});

test("estudo de caso abre, troca de projeto, fecha e devolve o foco", async ({ page }) => {
  await semIntro(page);
  // sem 3D: o teste é do diálogo (a galáxia em WebGL por software deixaria tudo lento)
  await page.goto("./?tier=off");
  await page.waitForTimeout(500);
  const botao = page.locator("#projetos").getByRole("button", { name: "Estudo de caso" }).first();
  await botao.scrollIntoViewIfNeeded();
  await botao.click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("heading", { level: 3 })).toHaveText("Figaro's Pizzaria 2.0");
  await page.keyboard.press("ArrowRight");
  await expect(dialogo.getByRole("heading", { level: 3 })).toHaveText("São Cristóvão 3.0");
  // com o diálogo aberto a página atrás não rola
  const antes = await page.evaluate(() => scrollY);
  await page.mouse.move(20, 20);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(antes);
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(botao).toBeFocused();
});

test("menu leva à seção logo abaixo do cabeçalho e o teclado continua rolando", async ({ page, isMobile }) => {
  test.skip(isMobile, "no celular o menu é outro (botão)");
  await semIntro(page);
  await page.goto("./?tier=off");
  await page.getByRole("banner").getByRole("link", { name: "Serviços" }).click();
  await expect.poll(() => page.evaluate(() => Math.round(document.getElementById("servicos")!.getBoundingClientRect().top)), { timeout: 5000 }).toBe(80);
  await page.waitForTimeout(600);
  const y = await page.evaluate(() => scrollY);
  await page.keyboard.press("End");
  await expect.poll(() => page.evaluate(() => scrollY), { timeout: 5000 }).toBeGreaterThan(y + 500);
});

test("o espaço do fundo entra depois da intro, com as galáxias", async ({ page }) => {
  await semIntro(page);
  await page.goto("./?tier=off");
  await expect(page.locator(".cosmos")).toHaveAttribute("data-on", "", { timeout: 5000 });
  expect(await page.locator(".cosmos [data-galaxia]").count()).toBeGreaterThan(5);
});

test("briefing monta a mensagem e valida os campos", async ({ page }) => {
  await semIntro(page);
  // o WhatsApp não abre de verdade no teste: guardamos o endereço
  await page.addInitScript(() => {
    window.open = (u?: string | URL) => {
      (window as Window & { __aberto?: string }).__aberto = String(u);
      return null;
    };
  });
  await page.goto("./?tier=off#contato");
  const form = page.locator("#contato form");
  await form.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
  await expect(form.getByText("Escreva seu nome.")).toBeVisible();
  await form.getByText("Loja ou catálogo").click();
  await form.getByText("Este mês").click();
  await form.getByLabel("Seu nome").fill("Ana");
  await form.getByLabel("Empresa (opcional)").fill("Doces da Ana");
  await form.getByLabel("Mensagem", { exact: true }).fill("Quero vender meus doces pelo WhatsApp.");
  const previa = form.getByRole("note");
  await expect(previa).toContainText("Olá, Carlos! Sou Ana, da Doces da Ana.");
  await expect(previa).toContainText("Tipo: Loja ou catálogo");
  await expect(previa).toContainText("Prazo: Este mês");
  await form.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
  const aberto = await page.evaluate(() => (window as Window & { __aberto?: string }).__aberto ?? "");
  expect(aberto.startsWith("https://wa.me/5548996170281?text=")).toBe(true);
  expect(decodeURIComponent(aberto)).toContain("Quero vender meus doces pelo WhatsApp.");
});

test("troca para inglês sem recarregar", async ({ page }) => {
  await semIntro(page);
  await page.goto("./?tier=off");
  await page.getByRole("button", { name: "Read in English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "I want a website" })).toBeVisible();
  await expect(page).toHaveTitle(/Junior Full Stack Developer/);
});

test("tela de carregamento aparece com o nome e libera a página sozinha", async ({ page }) => {
  await page.goto("./", { waitUntil: "commit" });
  const loader = page.locator(".loader");
  await expect(loader).toBeVisible();
  // o nome é desenhado em SVG (contornos das letras), não em texto
  await expect(loader.locator(".nome-intro .nome-letras path").first()).toBeVisible();
  await expect(loader).toBeHidden({ timeout: 5000 });
  await expect(page.locator("html")).not.toHaveClass(/carregando/);
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("todo o conteúdo aparece e o contato vira link", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".loader")).toBeHidden();
    await expect(page.getByRole("heading", { name: "Figaro's Pizzaria 2.0" })).toBeVisible();
    await expect(page.locator("#contato form")).toBeHidden();
    await expect(page.getByRole("link", { name: "Mande uma mensagem no WhatsApp" })).toBeVisible();
    // o arquivo mostra todos os repositórios
    expect(await page.locator(".arquivo-lista > li").count()).toBeGreaterThan(15);
  });
});

test.describe("com reduzir movimento", () => {
  test("sem intro e sem 3D: fica o pôster", async ({ page }) => {
    const erros = coletarErros(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    await expect(page.locator(".loader")).toBeHidden();
    await expect(page.locator(".hero-poster img")).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.locator(".hero-canvas")).toHaveCount(0);
    expect(erros).toEqual([]);
  });
});
