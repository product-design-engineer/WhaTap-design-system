/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

/**
 * @whatap/design-system 패키지 전용 Vite 설정.
 *
 * 이 vite.config.ts는 **Storybook과 Vitest(addon-vitest) 만**을 위함입니다.
 * 디자인 시스템 패키지 자체는 빌드 산출물이 없는 source-only 패키지
 * (exports map이 `src/*.ts` 직접 가리킴) 라서 별도 빌드 단계가 없습니다.
 * 소비자(예: prototypes/Product-SaaS) 가 패키지를 import하면 Vite가 source를
 * 직접 컴파일하므로 HMR 즉시 동작.
 */
export default defineConfig({
  // Tailwind 제거됨 — 스타일은 동결된 src/styles.css 를 preview.tsx 가 직접 import.
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
