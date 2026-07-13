import { defineConfig } from "@playwright/test";

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm --filter @om/storybook storybook:preview",
    port: 6007,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe"
  },
  use: {
    baseURL: "http://127.0.0.1:6007",
    launchOptions: chromiumExecutablePath
      ? {
          executablePath: chromiumExecutablePath
        }
      : undefined
  }
});
