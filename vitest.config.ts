import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    projects: [
      // ─── 단위 테스트 (store, hooks) ───────────────────────────────────────
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/__tests__/**/*.test.ts?(x)"],
          exclude: ["src/stories/**"],
        },
        plugins: [react()],
        resolve: {
          alias: { "@": path.resolve(dirname, "./src") },
        },
      },
      // ─── Storybook 컴포넌트 테스트 ────────────────────────────────────────
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
          include: ["src/stories/**/*.stories.?(m)[jt]s?(x)"],
        },
      },
    ],
  },
});
