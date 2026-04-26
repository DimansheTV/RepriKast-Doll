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
    command: "powershell -NoProfile -Command \"$env:Path += ';C:\\Program Files\\nodejs'; & 'C:\\Program Files\\nodejs\\corepack.cmd' pnpm dev --host 127.0.0.1 --port 4173\"",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
