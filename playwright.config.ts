import { defineConfig } from "@playwright/test";

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
    baseURL: "http://127.0.0.1:6007"
  }
});
