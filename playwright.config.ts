import { defineConfig, devices } from "@playwright/test";

/**
 * E2E do caminho crítico. Exige a aplicação rodando:
 *   backend: docker compose up -d  (em ../segundoCerebroApi)
 *   front:   npm run dev
 *
 * Não há webServer configurado de propósito: o dev server normalmente já está
 * de pé durante o desenvolvimento, e subir outro competiria pela porta 3000.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
