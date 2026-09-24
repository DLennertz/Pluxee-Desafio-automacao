import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["junit", { outputFile: "test-results/results.xml" }],
  ],
  use: {
    baseURL: "https://serverest.dev",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
});
