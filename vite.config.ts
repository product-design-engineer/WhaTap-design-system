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
  plugins: [react()],
  // exports map 이 dist 우선(외부 소비자용)으로 바뀐 뒤에도, DS 자신의 Storybook/Vitest 는
  // `source` 조건으로 src 의 .tsx 를 직접 해석한다 → react-docgen autodocs 유지 +
  // dist 빌드 없이 동작(Vercel build-storybook 가 dist 를 만들지 않으므로 필수). 외부 소비/모노레포용 아님.
  // 'development|production' 은 Vite 가 모드별로 치환하는 특수 토큰(기본값 보존).
  resolve: {
    conditions: ["source", "module", "browser", "development|production"],
  },
  test: {
    projects: [
      // 순수 로직(브라우저 불필요) — topology 레이아웃 엔진 등. node 환경이라 빠르다.
      // storybook 프로젝트와 분리해 둔 이유: 브라우저 프로바이더를 띄우지 않기 위함.
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
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
