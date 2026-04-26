import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "powershell -NoProfile -Command \"corepack pnpm build; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; corepack pnpm preview --host 127.0.0.1 --port 4173\"",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 180000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
