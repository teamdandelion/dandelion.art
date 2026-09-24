import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  use: {
    baseURL: "http://127.0.0.1:4340",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4340 --ignore-lock",
    url: "http://127.0.0.1:4340/music/cheat-sheet",
    reuseExistingServer: !process.env.CI,
  },
});
