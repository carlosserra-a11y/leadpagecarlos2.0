import { defineConfig, devices } from "@playwright/test";

const URL_BASE = "http://127.0.0.1:4173/leadpagecarlos2.0/";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "tests/relatorios" }]] : "list",
  use: {
    baseURL: URL_BASE,
    trace: "retain-on-failure",
    // WebGL por software: os testes também passam pela cena 3D
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [
    { name: "computador", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "celular", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "node ferramentas/servir.mjs",
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
  },
});
